"""
07_analysis.py
Domain 2 — Analysis & Insight Layer (Pranathi)
Modules 2.27–2.36

2.27  Vectorized computation on numeric columns
2.28  Distribution analysis (describe, skew, percentiles)
2.29  Correlation analysis — which features predict conversion
2.30  GroupBy segment comparisons: converters vs non-converters
2.31  Time-series / rolling trends by signup cohort month
2.32  Behavioral segmentation — user archetypes
2.33  Funnel & drop-off analysis
2.34  KPI definition & summary table
2.35  Root cause investigation — why do high-propensity users NOT convert?
2.36  Anomaly detection — users whose behavior is statistically unusual

Outputs (written to analysis/):
  - distribution_summary.csv
  - correlation_matrix.csv
  - converter_vs_nonconverter_comparison.csv
  - monthly_cohort_trends.csv
  - behavioral_archetypes.csv
  - funnel_analysis.csv
  - kpi_summary.csv
  - anomaly_users.csv
"""

import pandas as pd
import numpy as np
import os

# ------------------------------------------------------------------
# Setup
# ------------------------------------------------------------------
PROC = "data/processed"
OUT  = "analysis"
os.makedirs(OUT, exist_ok=True)

df = pd.read_csv(
    f"{PROC}/clean_trial_users.csv",
    parse_dates=["signup_date", "trial_end_date", "conversion_date"],
)

NUMERIC_FEATURES = [
    "total_sessions", "distinct_active_days", "distinct_features_used",
    "total_feature_events", "time_to_first_value_hrs",
    "feature_adoption_breadth", "session_frequency", "engagement_slope",
]

print("=" * 65)
print("DOMAIN 2 — ANALYSIS & INSIGHT LAYER")
print(f"Dataset: {df.shape[0]:,} users | Conversion rate: {df['converted'].mean():.1%}")
print("=" * 65)


# ------------------------------------------------------------------
# 2.27  Vectorized computation — derived ratio columns
# ------------------------------------------------------------------
print("\n[2.27] Vectorized computation...")

df["events_per_session"]    = np.where(
    df["total_sessions"] > 0,
    df["total_feature_events"] / df["total_sessions"],
    0,
)
df["active_day_ratio"]      = df["distinct_active_days"] / 14          # 14-day trial
df["features_per_active_day"] = np.where(
    df["distinct_active_days"] > 0,
    df["distinct_features_used"] / df["distinct_active_days"],
    0,
)
df["is_fast_activator"]     = (df["time_to_first_value_hrs"] <= 12).astype(int)
df["has_positive_slope"]    = (df["engagement_slope"] > 0).astype(int)

NUMERIC_FEATURES_EXT = NUMERIC_FEATURES + [
    "events_per_session", "active_day_ratio", "features_per_active_day",
]

print("  New derived columns: events_per_session, active_day_ratio, "
      "features_per_active_day, is_fast_activator, has_positive_slope")


# ------------------------------------------------------------------
# 2.28  Distribution analysis
# ------------------------------------------------------------------
print("\n[2.28] Distribution analysis...")

dist = df[NUMERIC_FEATURES_EXT].describe(percentiles=[.10, .25, .50, .75, .90]).T
dist["skewness"] = df[NUMERIC_FEATURES_EXT].skew()
dist["kurtosis"] = df[NUMERIC_FEATURES_EXT].kurtosis()
dist = dist.round(4)
dist.to_csv(f"{OUT}/distribution_summary.csv")
print(dist[["mean", "std", "50%", "skewness"]].to_string())


# ------------------------------------------------------------------
# 2.29  Correlation analysis — Pearson vs converted label
# ------------------------------------------------------------------
print("\n[2.29] Correlation with 'converted'...")

df["converted_int"] = df["converted"].astype(int)

corr_cols = NUMERIC_FEATURES_EXT + [
    "is_fast_activator", "has_positive_slope",
    "used_power_feature",          # bool -> treated as 0/1 by corr()
]
corr_matrix = df[corr_cols + ["converted_int"]].corr()
corr_matrix.round(4).to_csv(f"{OUT}/correlation_matrix.csv")

corr_with_target = (
    corr_matrix["converted_int"]
    .drop("converted_int")
    .sort_values(ascending=False)
)
print("\n  Pearson correlation with 'converted' (descending):")
for feat, val in corr_with_target.items():
    bar = "█" * int(abs(val) * 40)
    sign = "+" if val >= 0 else "-"
    print(f"    {feat:<30s} {sign}{abs(val):.4f}  {bar}")


# ------------------------------------------------------------------
# 2.30  GroupBy: converters vs non-converters
# ------------------------------------------------------------------
print("\n[2.30] Converter vs Non-converter comparison...")

compare_cols = NUMERIC_FEATURES_EXT + [
    "is_fast_activator", "has_positive_slope", "used_power_feature",
]
# used_power_feature is bool — cast to numeric for aggregation
df_agg = df.copy()
df_agg["used_power_feature"] = df_agg["used_power_feature"].astype(int)

group_stats = (
    df_agg.groupby("converted")[compare_cols]
    .agg(["mean", "median"])
    .round(4)
)
group_stats.columns = ["_".join(c) for c in group_stats.columns]
group_stats.index = ["Non-Converted", "Converted"]

# Add lift column: converted_mean / non_converted_mean
lift_rows = []
for col in compare_cols:
    nc_mean = group_stats.loc["Non-Converted", f"{col}_mean"]
    c_mean  = group_stats.loc["Converted",     f"{col}_mean"]
    lift    = round(c_mean / nc_mean, 3) if nc_mean != 0 else float("inf")
    lift_rows.append({"feature": col,
                      "non_converted_mean": round(nc_mean, 4),
                      "converted_mean":     round(c_mean,  4),
                      "lift_ratio":         lift})

lift_df = pd.DataFrame(lift_rows).sort_values("lift_ratio", ascending=False)
lift_df.to_csv(f"{OUT}/converter_vs_nonconverter_comparison.csv", index=False)

print("\n  Feature lift (Converted mean / Non-converted mean):")
print(lift_df.to_string(index=False))


# ------------------------------------------------------------------
# 2.31  Time-series / rolling trends by signup cohort month
# ------------------------------------------------------------------
print("\n[2.31] Monthly cohort trends...")

df["cohort_month"] = df["signup_date"].dt.to_period("M").astype(str)

monthly = (
    df.groupby("cohort_month")
    .agg(
        signups=("user_id", "count"),
        conversions=("converted_int", "sum"),
        conversion_rate=("converted_int", "mean"),
        avg_sessions=("total_sessions", "mean"),
        avg_ttfv_hrs=("time_to_first_value_hrs", "mean"),
        avg_features_used=("distinct_features_used", "mean"),
        power_feature_rate=("used_power_feature", lambda x: x.astype(int).mean()),
        positive_slope_rate=("has_positive_slope", "mean"),
    )
    .reset_index()
    .round(4)
)

# 3-month rolling conversion rate
monthly["rolling_3m_conv_rate"] = (
    monthly["conversion_rate"].rolling(window=3, min_periods=1).mean().round(4)
)

monthly.to_csv(f"{OUT}/monthly_cohort_trends.csv", index=False)
print(monthly[["cohort_month", "signups", "conversions", "conversion_rate",
               "rolling_3m_conv_rate"]].to_string(index=False))


# ------------------------------------------------------------------
# 2.32  Behavioral segmentation — user archetypes
# ------------------------------------------------------------------
print("\n[2.32] Behavioral archetypes...")

def assign_archetype(row):
    """
    Rule-based archetypes derived from the three strongest predictors:
    power feature usage, time-to-first-value, and engagement slope.
    """
    pf  = bool(row["used_power_feature"])
    fast = row["time_to_first_value_hrs"] <= 24
    slope_pos = row["engagement_slope"] > 0
    sessions  = row["total_sessions"]

    if pf and fast and slope_pos:
        return "Champion"          # fast activator, power user, growing
    elif pf and fast:
        return "Power Adopter"     # fast + power, but usage flattening
    elif pf and slope_pos:
        return "Late Bloomer"      # slow start but picks up power features
    elif sessions == 0:
        return "Ghost"             # never engaged
    elif sessions <= 2 and not pf:
        return "Window Shopper"    # very low activity, no power features
    elif slope_pos and not pf:
        return "Growing Casual"    # growing but sticking to basic features
    else:
        return "Plateaued User"    # has some activity but declining/flat

df["archetype"] = df.apply(assign_archetype, axis=1)

archetype_stats = (
    df.groupby("archetype")
    .agg(
        users=("user_id", "count"),
        conversion_rate=("converted_int", "mean"),
        avg_sessions=("total_sessions", "mean"),
        avg_features=("distinct_features_used", "mean"),
        avg_ttfv=("time_to_first_value_hrs", "mean"),
        avg_propensity=("conversion_propensity_score", "mean"),
    )
    .round(3)
    .sort_values("conversion_rate", ascending=False)
    .reset_index()
)
archetype_stats.to_csv(f"{OUT}/behavioral_archetypes.csv", index=False)
print(archetype_stats.to_string(index=False))


# ------------------------------------------------------------------
# 2.33  Funnel & drop-off analysis
# ------------------------------------------------------------------
print("\n[2.33] Funnel & drop-off analysis...")

total = len(df)

funnel_stages = [
    ("Signed Up (Trial Start)",          total,
     total),
    ("Had Any Session",                  (df["total_sessions"] > 0).sum(),
     total),
    ("Used At Least 1 Feature",          (df["distinct_features_used"] > 0).sum(),
     total),
    ("Used Power Feature",               df["used_power_feature"].astype(int).sum(),
     total),
    ("Reached First Value ≤ 24h",        (df["time_to_first_value_hrs"] <= 24).sum(),
     total),
    ("Completed Trial Window (Day 14)",  (df["drop_off_stage"] == "completed_trial_window").sum(),
     total),
    ("Converted to Paid",                df["converted_int"].sum(),
     total),
]

funnel_rows = []
prev_count = total
for stage, count, base in funnel_stages:
    pct_of_total  = count / total * 100
    step_dropoff  = (prev_count - count) / prev_count * 100 if prev_count > 0 else 0
    funnel_rows.append({
        "stage":           stage,
        "users":           int(count),
        "pct_of_total":    round(pct_of_total, 1),
        "step_dropoff_pct": round(step_dropoff, 1),
    })
    prev_count = count

funnel_df = pd.DataFrame(funnel_rows)
funnel_df.to_csv(f"{OUT}/funnel_analysis.csv", index=False)
print(funnel_df.to_string(index=False))

# Dropoff stage breakdown
print("\n  Drop-off stage conversion rates:")
drop_conv = (
    df.groupby("drop_off_stage")["converted_int"]
    .agg(users="count", converted="sum", conv_rate="mean")
    .round(3)
    .reset_index()
)
print(drop_conv.to_string(index=False))


# ------------------------------------------------------------------
# 2.34  KPI definition & summary table
# ------------------------------------------------------------------
print("\n[2.34] KPI summary...")

# Segment-level conversion rates for key cuts
def seg_conv(mask, label):
    sub = df[mask]
    return {
        "kpi": label,
        "users": len(sub),
        "converted": int(sub["converted_int"].sum()),
        "conversion_rate": round(sub["converted_int"].mean(), 4),
    }

kpis = [
    seg_conv(pd.Series([True] * len(df)), "Overall"),
    seg_conv(df["time_to_first_value_hrs"] <= 12,  "TTFV ≤ 12h"),
    seg_conv(df["time_to_first_value_hrs"] <= 24,  "TTFV ≤ 24h"),
    seg_conv(df["time_to_first_value_hrs"] > 72,   "TTFV > 72h"),
    seg_conv(df["used_power_feature"] == True,     "Used Power Feature"),
    seg_conv(df["used_power_feature"] == False,    "No Power Feature"),
    seg_conv(df["engagement_slope"] > 0,           "Positive Slope"),
    seg_conv(df["engagement_slope"] <= 0,          "Flat/Negative Slope"),
    seg_conv(df["drop_off_stage"] == "completed_trial_window", "Completed Trial Window"),
    seg_conv(df["drop_off_stage"] == "early_dropoff",          "Early Drop-off (≤Day 3)"),
    seg_conv(df["drop_off_stage"] == "mid_trial_dropoff",      "Mid-Trial Drop-off (≤Day 8)"),
    seg_conv(df["company_size"] == "200+",         "Enterprise (200+)"),
    seg_conv(df["company_size"] == "51-200",       "Mid-Market (51-200)"),
    seg_conv(df["company_size"] == "11-50",        "SMB (11-50)"),
    seg_conv(df["company_size"] == "1-10",         "Startup (1-10)"),
    seg_conv(df["user_segment"] == "High",         "High Engagement Segment"),
    seg_conv(df["user_segment"] == "Medium",       "Medium Engagement Segment"),
    seg_conv(df["user_segment"] == "Low",          "Low Engagement Segment"),
    seg_conv(df["archetype"] == "Champion",        "Archetype: Champion"),
    seg_conv(df["archetype"] == "Ghost",           "Archetype: Ghost"),
    seg_conv(df["archetype"] == "Window Shopper",  "Archetype: Window Shopper"),
]

kpi_df = pd.DataFrame(kpis)
kpi_df.to_csv(f"{OUT}/kpi_summary.csv", index=False)
print(kpi_df.to_string(index=False))


# ------------------------------------------------------------------
# 2.35  Root cause — why do high-propensity users NOT convert?
# ------------------------------------------------------------------
print("\n[2.35] Root cause: high-propensity non-converters...")

high_prop_nc = df[
    (df["conversion_propensity_score"] >= 70) & (df["converted"] == False)
].copy()

print(f"  High-propensity (score ≥70) non-converters: {len(high_prop_nc)}")
print("  Profile:")
print(high_prop_nc[NUMERIC_FEATURES_EXT].describe().round(2).T[["mean", "50%", "std"]])
print("\n  Drop-off stage breakdown:")
print(high_prop_nc["drop_off_stage"].value_counts())
print("\n  Archetype breakdown:")
print(high_prop_nc["archetype"].value_counts())


# ------------------------------------------------------------------
# 2.36  Anomaly detection — statistical outliers on key metrics
# ------------------------------------------------------------------
print("\n[2.36] Anomaly detection...")

anomaly_flags = pd.DataFrame({"user_id": df["user_id"]})

for col in ["total_sessions", "distinct_features_used",
            "time_to_first_value_hrs", "total_feature_events"]:
    mean = df[col].mean()
    std  = df[col].std()
    anomaly_flags[f"{col}_zscore"] = ((df[col] - mean) / std).round(3)

# Flag any user with |z| > 3 on ANY metric
z_cols = [c for c in anomaly_flags.columns if c.endswith("_zscore")]
anomaly_flags["max_abs_zscore"] = anomaly_flags[z_cols].abs().max(axis=1).round(3)
anomaly_flags["is_anomaly"]     = anomaly_flags["max_abs_zscore"] > 3

anomaly_users = anomaly_flags[anomaly_flags["is_anomaly"]].copy()
anomaly_users = anomaly_users.merge(
    df[["user_id", "converted", "archetype", "user_segment",
        "total_sessions", "distinct_features_used",
        "time_to_first_value_hrs", "total_feature_events"]],
    on="user_id"
)
anomaly_users.to_csv(f"{OUT}/anomaly_users.csv", index=False)
print(f"  Anomaly users detected (|z|>3 on any key metric): {len(anomaly_users)}")
print(anomaly_users[["user_id", "max_abs_zscore", "total_sessions",
                      "total_feature_events", "converted", "archetype"]].to_string(index=False))


# ------------------------------------------------------------------
# Save enriched dataset for SQL layer
# ------------------------------------------------------------------
df.to_csv(f"{PROC}/clean_trial_users_enriched.csv", index=False)
print(f"\n[DONE] Enriched dataset saved → {PROC}/clean_trial_users_enriched.csv")
print(f"[DONE] All analysis outputs saved → {OUT}/")
print("\nSummary of key findings:")
print(f"  • Overall conversion rate          : {df['converted_int'].mean():.1%}")

ttfv12_rate = df[df['time_to_first_value_hrs'] <= 12]['converted_int'].mean()
ttfv72_rate = df[df['time_to_first_value_hrs'] > 72]['converted_int'].mean()
print(f"  • TTFV ≤12h conversion rate        : {ttfv12_rate:.1%}")
print(f"  • TTFV >72h conversion rate        : {ttfv72_rate:.1%}")
print(f"  • Lift (≤12h vs >72h)              : {ttfv12_rate/ttfv72_rate:.2f}x")

pf_rate  = df[df['used_power_feature'] == True]['converted_int'].mean()
npf_rate = df[df['used_power_feature'] == False]['converted_int'].mean()
print(f"  • Power feature users conv rate    : {pf_rate:.1%}")
print(f"  • Non-power feature users conv rate: {npf_rate:.1%}")

champ_rate = df[df['archetype'] == 'Champion']['converted_int'].mean()
ghost_rate = df[df['archetype'] == 'Ghost']['converted_int'].mean()
print(f"  • Champion archetype conv rate     : {champ_rate:.1%}")
print(f"  • Ghost archetype conv rate        : {ghost_rate:.1%}")
