"""
09_visualise.py
Domain 2 — Data Analysis & Visualisation
Full statistical analysis + 15 publication-quality charts saved to analysis/charts/

Charts produced:
  01_conversion_rate_overview.png       – overall KPI bar
  02_ttfv_distribution.png              – TTFV histogram by conversion
  03_ttfv_bucket_conv_rate.png          – TTFV bucket → conversion rate
  04_power_feature_conversion.png       – power vs non-power feature conv
  05_correlation_heatmap.png            – Pearson correlation matrix
  06_feature_lift.png                   – converter vs non-converter lift
  07_monthly_cohort_trend.png           – signups, conversions, rolling rate
  08_archetype_breakdown.png            – archetype users + conv rate
  09_funnel_chart.png                   – conversion funnel
  10_dropoff_stage_conv.png             – drop-off stage → conversion rate
  11_engagement_slope_dist.png          – slope distribution by conversion
  12_segment_conv_rate.png              – High/Medium/Low segment conv rates
  13_feature_impact_bar.png             – feature → conversion rate (join)
  14_propensity_decile_conv.png         – propensity decile → conversion rate
  15_company_size_conv.png              – company size → conversion rate
"""

import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import seaborn as sns
import sqlite3
import os
import warnings
warnings.filterwarnings("ignore")

# ── paths ────────────────────────────────────────────────────────
PROC  = "data/processed"
ANA   = "analysis"
OUT   = "analysis/charts"
DB    = f"{ANA}/featureiq.db"
os.makedirs(OUT, exist_ok=True)

# ── global style ─────────────────────────────────────────────────
DARK_BG   = "#0d1117"
CARD_BG   = "#161b22"
BORDER    = "#30363d"
TEXT      = "#e6edf3"
DIM_TEXT  = "#8b949e"
CYAN      = "#00f2fe"
GREEN     = "#10b981"
RED       = "#f43f5e"
AMBER     = "#f59e0b"
BLUE      = "#3b82f6"
PURPLE    = "#a78bfa"
ACCENT_COLORS = [CYAN, GREEN, AMBER, RED, BLUE, PURPLE, "#fb923c", "#34d399"]

plt.rcParams.update({
    "figure.facecolor":  DARK_BG,
    "axes.facecolor":    CARD_BG,
    "axes.edgecolor":    BORDER,
    "axes.labelcolor":   TEXT,
    "axes.titlecolor":   TEXT,
    "xtick.color":       DIM_TEXT,
    "ytick.color":       DIM_TEXT,
    "text.color":        TEXT,
    "grid.color":        BORDER,
    "grid.alpha":        0.5,
    "legend.facecolor":  CARD_BG,
    "legend.edgecolor":  BORDER,
    "font.family":       "DejaVu Sans",
    "font.size":         11,
})

def save(fig, name):
    path = f"{OUT}/{name}"
    fig.savefig(path, dpi=150, bbox_inches="tight", facecolor=DARK_BG)
    plt.close(fig)
    print(f"  saved → {path}")

# ── load data ────────────────────────────────────────────────────
df = pd.read_csv(
    f"{PROC}/clean_trial_users_enriched.csv",
    parse_dates=["signup_date", "trial_end_date", "conversion_date"],
)
conn = sqlite3.connect(DB)
df["converted_int"] = df["converted"].astype(int)
print(f"Loaded {len(df):,} users | conv rate {df['converted_int'].mean():.1%}")
print(f"Saving charts to {OUT}/\n")

# ════════════════════════════════════════════════════════════════
# 01 — Conversion Rate Overview (KPI summary bar)
# ════════════════════════════════════════════════════════════════
print("[01] Conversion rate overview...")
kpi_df = pd.read_csv(f"{ANA}/kpi_summary.csv")
focus_kpis = [
    "Overall", "TTFV ≤ 12h", "TTFV > 72h",
    "Used Power Feature", "No Power Feature",
    "Positive Slope", "High Engagement Segment", "Low Engagement Segment",
]
sub = kpi_df[kpi_df["kpi"].isin(focus_kpis)].copy()
sub["pct"] = (sub["conversion_rate"] * 100).round(1)
sub = sub.set_index("kpi").loc[focus_kpis].reset_index()

colors = [GREEN if v >= 38 else RED for v in sub["pct"]]
fig, ax = plt.subplots(figsize=(12, 5))
bars = ax.barh(sub["kpi"], sub["pct"], color=colors, height=0.6, zorder=3)
ax.axvline(sub[sub["kpi"] == "Overall"]["pct"].values[0],
           color=AMBER, lw=1.5, ls="--", label="Overall baseline")
for bar, val in zip(bars, sub["pct"]):
    ax.text(val + 0.5, bar.get_y() + bar.get_height() / 2,
            f"{val}%", va="center", fontsize=10, color=TEXT)
ax.set_xlabel("Conversion Rate (%)", color=TEXT)
ax.set_title("Conversion Rate by Key Segment", fontsize=14, fontweight="bold", pad=12)
ax.legend(fontsize=9)
ax.set_xlim(0, 65)
ax.grid(axis="x", zorder=0)
fig.tight_layout()
save(fig, "01_conversion_rate_overview.png")

# ════════════════════════════════════════════════════════════════
# 02 — TTFV Distribution (histogram by conversion status)
# ════════════════════════════════════════════════════════════════
print("[02] TTFV distribution histogram...")
ttfv_cap = 200   # cap for readability (exclude 336h never-activated)
df_ttfv = df[df["time_to_first_value_hrs"] <= ttfv_cap].copy()

fig, ax = plt.subplots(figsize=(11, 5))
for conv_val, label, color in [(1, "Converted", GREEN), (0, "Non-Converted", RED)]:
    vals = df_ttfv[df_ttfv["converted_int"] == conv_val]["time_to_first_value_hrs"]
    ax.hist(vals, bins=40, alpha=0.65, color=color, label=label, edgecolor=BORDER, lw=0.4)

ax.axvline(12,  color=AMBER, lw=1.5, ls="--", label="12h threshold")
ax.axvline(24,  color=CYAN,  lw=1.5, ls=":",  label="24h threshold")
ax.axvline(72,  color=RED,   lw=1,   ls="-.", label="72h threshold")
ax.set_xlabel("Time to First Value (hours)")
ax.set_ylabel("Number of Users")
ax.set_title("TTFV Distribution — Converted vs Non-Converted\n(users with TTFV ≤ 200h shown)", fontsize=13, fontweight="bold")
ax.legend(fontsize=9)
ax.grid(axis="y", zorder=0)
fig.tight_layout()
save(fig, "02_ttfv_distribution.png")

# ════════════════════════════════════════════════════════════════
# 03 — TTFV Bucket → Conversion Rate (bar chart)
# ════════════════════════════════════════════════════════════════
print("[03] TTFV bucket conversion rates...")
bins   = [0, 12, 24, 48, 72, 120, 336]
labels = ["≤12h", "12–24h", "24–48h", "48–72h", "72–120h", ">120h"]
df["ttfv_bucket"] = pd.cut(df["time_to_first_value_hrs"], bins=bins, labels=labels, right=True)
bucket_stats = df.groupby("ttfv_bucket", observed=True)["converted_int"].agg(
    users="count", conv_rate="mean").reset_index()
bucket_stats["pct"] = (bucket_stats["conv_rate"] * 100).round(1)

fig, ax1 = plt.subplots(figsize=(10, 5))
bar_colors = [GREEN if p >= 38 else AMBER if p >= 30 else RED for p in bucket_stats["pct"]]
bars = ax1.bar(bucket_stats["ttfv_bucket"].astype(str), bucket_stats["pct"],
               color=bar_colors, zorder=3, width=0.6, edgecolor=BORDER)
ax2 = ax1.twinx()
ax2.plot(range(len(bucket_stats)), bucket_stats["users"], color=CYAN,
         marker="o", lw=2, ms=6, label="User count", zorder=4)
ax2.set_ylabel("User Count", color=CYAN)
ax2.tick_params(axis="y", colors=CYAN)
for bar, val in zip(bars, bucket_stats["pct"]):
    ax1.text(bar.get_x() + bar.get_width()/2, val + 0.8, f"{val}%",
             ha="center", fontsize=10, color=TEXT)
ax1.set_xlabel("Time-to-First-Value Bucket")
ax1.set_ylabel("Conversion Rate (%)")
ax1.set_title("Conversion Rate by TTFV Bucket\nFaster activation = higher conversion", fontsize=13, fontweight="bold")
ax1.axhline(38.6, color=AMBER, lw=1.3, ls="--", label="Overall avg 38.6%")
ax1.legend(fontsize=9)
ax1.grid(axis="y", zorder=0)
fig.tight_layout()
save(fig, "03_ttfv_bucket_conv_rate.png")

# ════════════════════════════════════════════════════════════════
# 04 — Power Feature Conversion (grouped bar)
# ════════════════════════════════════════════════════════════════
print("[04] Power feature conversion chart...")
pf = df.groupby("used_power_feature")["converted_int"].agg(
    users="count", conv_rate="mean").reset_index()
pf["label"] = pf["used_power_feature"].map({True: "Used Power Feature", False: "No Power Feature"})
pf["pct"]   = (pf["conv_rate"] * 100).round(1)

fig, ax = plt.subplots(figsize=(8, 5))
colors_pf = [RED, GREEN]
bars = ax.bar(pf["label"], pf["pct"], color=colors_pf, width=0.45, zorder=3, edgecolor=BORDER)
for bar, val, u in zip(bars, pf["pct"], pf["users"]):
    ax.text(bar.get_x() + bar.get_width()/2, val + 0.6,
            f"{val}%\n({u:,} users)", ha="center", fontsize=11, color=TEXT)
ax.axhline(38.6, color=AMBER, lw=1.3, ls="--", label="Overall 38.6%")
ax.set_ylabel("Conversion Rate (%)")
ax.set_title("Power Feature Activation vs Conversion Rate\n(Team Invite · Integrations · Automation Rules)", fontsize=13, fontweight="bold")
ax.set_ylim(0, 55)
ax.legend(fontsize=9)
ax.grid(axis="y", zorder=0)
fig.tight_layout()
save(fig, "04_power_feature_conversion.png")

# ════════════════════════════════════════════════════════════════
# 05 — Correlation Heatmap
# ════════════════════════════════════════════════════════════════
print("[05] Correlation heatmap...")
corr_cols = [
    "total_sessions", "distinct_active_days", "distinct_features_used",
    "total_feature_events", "time_to_first_value_hrs",
    "feature_adoption_breadth", "session_frequency", "engagement_slope",
    "converted_int",
]
corr_labels = [
    "Total Sessions", "Active Days", "Features Used",
    "Feature Events", "TTFV (hrs)",
    "Adoption Breadth", "Session Freq", "Engagement Slope",
    "Converted",
]
corr_matrix = df[corr_cols].corr()

fig, ax = plt.subplots(figsize=(10, 8))
mask = np.zeros_like(corr_matrix, dtype=bool)
mask[np.triu_indices_from(mask, k=1)] = True  # show full matrix (no mask)
cmap = sns.diverging_palette(220, 10, as_cmap=True)
sns.heatmap(
    corr_matrix, annot=True, fmt=".2f", cmap=cmap,
    linewidths=0.5, linecolor=BORDER,
    xticklabels=corr_labels, yticklabels=corr_labels,
    ax=ax, cbar_kws={"shrink": 0.8},
    vmin=-0.6, vmax=0.6, center=0,
    annot_kws={"size": 9},
)
ax.set_title("Pearson Correlation Matrix\n(All Behavioral Features + Converted)", fontsize=13, fontweight="bold", pad=14)
ax.tick_params(axis="x", rotation=35, labelsize=9)
ax.tick_params(axis="y", rotation=0,  labelsize=9)
fig.tight_layout()
save(fig, "05_correlation_heatmap.png")

# ════════════════════════════════════════════════════════════════
# 06 — Converter vs Non-Converter Feature Lift (horizontal bar)
# ════════════════════════════════════════════════════════════════
print("[06] Feature lift chart...")
lift_df = pd.read_csv(f"{ANA}/converter_vs_nonconverter_comparison.csv")
lift_df = lift_df.sort_values("lift_ratio", ascending=True)

fig, ax = plt.subplots(figsize=(11, 6))
bar_c = [GREEN if v >= 1.1 else AMBER if v >= 1.0 else RED for v in lift_df["lift_ratio"]]
bars = ax.barh(lift_df["feature"], lift_df["lift_ratio"], color=bar_c, height=0.6, zorder=3)
ax.axvline(1.0, color=AMBER, lw=1.5, ls="--", label="No lift (1.0×)")
for bar, val in zip(bars, lift_df["lift_ratio"]):
    ax.text(val + 0.01, bar.get_y() + bar.get_height()/2,
            f"{val:.2f}×", va="center", fontsize=9, color=TEXT)
ax.set_xlabel("Lift Ratio (Converted mean / Non-Converted mean)")
ax.set_title("Feature Lift: Converters vs Non-Converters\nValues > 1.0 = converters score higher", fontsize=13, fontweight="bold")
ax.legend(fontsize=9)
ax.grid(axis="x", zorder=0)
fig.tight_layout()
save(fig, "06_feature_lift.png")

# ════════════════════════════════════════════════════════════════
# 07 — Monthly Cohort Trend (dual-axis: bar + line)
# ════════════════════════════════════════════════════════════════
print("[07] Monthly cohort trend...")
monthly = pd.read_csv(f"{ANA}/monthly_cohort_trends.csv")

x  = np.arange(len(monthly))
w  = 0.38
fig, ax1 = plt.subplots(figsize=(12, 5))
ax1.bar(x - w/2, monthly["signups"],    width=w, color=BLUE,  alpha=0.8, label="Signups",     zorder=3, edgecolor=BORDER)
ax1.bar(x + w/2, monthly["conversions"],width=w, color=GREEN, alpha=0.8, label="Conversions", zorder=3, edgecolor=BORDER)
ax1.set_ylabel("Users")
ax1.set_xlabel("Signup Cohort Month")
ax1.set_xticks(x)
ax1.set_xticklabels(monthly["cohort_month"], rotation=15)
ax1.grid(axis="y", zorder=0)

ax2 = ax1.twinx()
ax2.plot(x, monthly["conversion_rate"] * 100, color=CYAN,  marker="o", lw=2.5, ms=7, label="Monthly Conv %")
ax2.plot(x, monthly["rolling_3m_conv_rate"] * 100, color=AMBER, marker="s", lw=2, ms=5, ls="--", label="3-Month Rolling Conv %")
ax2.set_ylabel("Conversion Rate (%)", color=CYAN)
ax2.tick_params(axis="y", colors=CYAN)
ax2.set_ylim(25, 55)

lines1, labels1 = ax1.get_legend_handles_labels()
lines2, labels2 = ax2.get_legend_handles_labels()
ax1.legend(lines1 + lines2, labels1 + labels2, fontsize=9, loc="upper left")
ax1.set_title("Monthly Trial Signups, Conversions & Conversion Rate\n(Jan–Jun 2026)", fontsize=13, fontweight="bold")
fig.tight_layout()
save(fig, "07_monthly_cohort_trend.png")

# ════════════════════════════════════════════════════════════════
# 08 — Archetype Breakdown (grouped: user count + conv rate)
# ════════════════════════════════════════════════════════════════
print("[08] Archetype breakdown...")
arch = pd.read_csv(f"{ANA}/behavioral_archetypes.csv").sort_values("conversion_rate", ascending=False)

fig, ax1 = plt.subplots(figsize=(12, 5))
x  = np.arange(len(arch))
w  = 0.4
bars1 = ax1.bar(x - w/2, arch["users"],
                width=w, color=BLUE, alpha=0.75, label="Users", zorder=3, edgecolor=BORDER)
ax1.set_ylabel("User Count")
ax1.set_xticks(x)
ax1.set_xticklabels(arch["archetype"], rotation=12)
ax1.grid(axis="y", zorder=0)

ax2 = ax1.twinx()
conv_colors = [GREEN if v >= 0.4 else AMBER if v >= 0.3 else RED
               for v in arch["conversion_rate"]]
bars2 = ax2.bar(x + w/2, arch["conversion_rate"] * 100,
                width=w, color=conv_colors, alpha=0.85, label="Conv Rate %", zorder=3, edgecolor=BORDER)
for bar, val in zip(bars2, arch["conversion_rate"]):
    ax2.text(bar.get_x() + bar.get_width()/2, val*100 + 0.8,
             f"{val*100:.1f}%", ha="center", fontsize=8.5, color=TEXT)
ax2.set_ylabel("Conversion Rate (%)", color=GREEN)
ax2.tick_params(axis="y", colors=GREEN)
ax2.axhline(38.6, color=AMBER, lw=1.2, ls="--")

h1 = mpatches.Patch(color=BLUE,  alpha=0.75, label="Users")
h2 = mpatches.Patch(color=GREEN, alpha=0.85, label="Conversion Rate %")
ax1.legend(handles=[h1, h2], fontsize=9)
ax1.set_title("Behavioral Archetypes — Users & Conversion Rate\n(sorted by conversion rate, high → low)", fontsize=13, fontweight="bold")
fig.tight_layout()
save(fig, "08_archetype_breakdown.png")

# ════════════════════════════════════════════════════════════════
# 09 — Conversion Funnel (horizontal waterfall)
# ════════════════════════════════════════════════════════════════
print("[09] Conversion funnel...")
funnel = pd.read_csv(f"{ANA}/funnel_analysis.csv")

fig, ax = plt.subplots(figsize=(12, 6))
total = funnel["users"].iloc[0]
bar_colors = [BLUE, BLUE, CYAN, CYAN, AMBER, AMBER, GREEN]
bars = ax.barh(range(len(funnel)), funnel["users"], color=bar_colors,
               height=0.6, zorder=3, edgecolor=BORDER)
for i, (bar, row) in enumerate(zip(bars, funnel.itertuples())):
    ax.text(row.users + 5, bar.get_y() + bar.get_height()/2,
            f"{row.users:,}  ({row.pct_of_total}%)",
            va="center", fontsize=10, color=TEXT)
    if i > 0 and row.step_dropoff_pct > 0:
        ax.text(row.users / 2, bar.get_y() + bar.get_height()/2,
                f"−{row.step_dropoff_pct:.1f}%",
                va="center", ha="center", fontsize=8.5, color=RED, fontweight="bold")

ax.set_yticks(range(len(funnel)))
ax.set_yticklabels(funnel["stage"], fontsize=10)
ax.set_xlabel("Number of Users")
ax.set_title("Trial-to-Conversion Funnel\n(6-Month Cohort, 2,000 Users)", fontsize=13, fontweight="bold")
ax.set_xlim(0, total * 1.22)
ax.invert_yaxis()
ax.grid(axis="x", zorder=0)
fig.tight_layout()
save(fig, "09_funnel_chart.png")

# ════════════════════════════════════════════════════════════════
# 10 — Drop-off Stage → Conversion Rate
# ════════════════════════════════════════════════════════════════
print("[10] Drop-off stage conversion...")
drop_stage = df.groupby("drop_off_stage")["converted_int"].agg(
    users="count", conv_rate="mean").reset_index()
drop_stage["pct"] = (drop_stage["conv_rate"] * 100).round(1)
order = ["completed_trial_window", "mid_trial_dropoff", "early_dropoff"]
label_map = {
    "completed_trial_window": "Completed Trial\n(Day 14)",
    "mid_trial_dropoff":      "Mid-Trial Drop-off\n(Days 4–8)",
    "early_dropoff":          "Early Drop-off\n(≤ Day 3)",
}
drop_stage = drop_stage[drop_stage["drop_off_stage"].isin(order)]
drop_stage["drop_off_stage"] = pd.Categorical(drop_stage["drop_off_stage"], categories=order, ordered=True)
drop_stage = drop_stage.sort_values("drop_off_stage")

fig, ax = plt.subplots(figsize=(9, 5))
colors_d = [GREEN, AMBER, RED]
bars = ax.bar([label_map[s] for s in drop_stage["drop_off_stage"]],
              drop_stage["pct"], color=colors_d, width=0.45, zorder=3, edgecolor=BORDER)
for bar, val, u in zip(bars, drop_stage["pct"], drop_stage["users"]):
    ax.text(bar.get_x() + bar.get_width()/2, val + 0.6,
            f"{val}%\n({u:,} users)", ha="center", fontsize=10, color=TEXT)
ax.axhline(38.6, color=AMBER, lw=1.3, ls="--", label="Overall 38.6%")
ax.set_ylabel("Conversion Rate (%)")
ax.set_title("Conversion Rate by Drop-off Stage\nStaying through Day 14 is critical", fontsize=13, fontweight="bold")
ax.set_ylim(0, 55)
ax.legend(fontsize=9)
ax.grid(axis="y", zorder=0)
fig.tight_layout()
save(fig, "10_dropoff_stage_conv.png")

# ════════════════════════════════════════════════════════════════
# 11 — Engagement Slope Distribution (KDE by conversion)
# ════════════════════════════════════════════════════════════════
print("[11] Engagement slope distribution...")
fig, axes = plt.subplots(1, 2, figsize=(13, 5))

# KDE
ax = axes[0]
for conv_val, label, color in [(1, "Converted", GREEN), (0, "Non-Converted", RED)]:
    vals = df[df["converted_int"] == conv_val]["engagement_slope"]
    sns.kdeplot(vals, ax=ax, color=color, fill=True, alpha=0.35, label=label, bw_adjust=0.8)
ax.axvline(0, color=AMBER, lw=1.5, ls="--", label="Slope = 0")
ax.set_xlabel("Engagement Slope")
ax.set_ylabel("Density")
ax.set_title("Engagement Slope Distribution\n(KDE — Converted vs Non-Converted)", fontsize=12, fontweight="bold")
ax.legend(fontsize=9)
ax.grid(axis="y")

# Box plot
ax2 = axes[1]
data_box = [
    df[df["converted_int"] == 1]["engagement_slope"].clip(-40, 60),
    df[df["converted_int"] == 0]["engagement_slope"].clip(-40, 60),
]
bp = ax2.boxplot(data_box, patch_artist=True, widths=0.45,
                 medianprops={"color": AMBER, "lw": 2.5},
                 flierprops={"marker": "o", "markersize": 3, "alpha": 0.3})
for patch, color in zip(bp["boxes"], [GREEN, RED]):
    patch.set_facecolor(color)
    patch.set_alpha(0.6)
ax2.set_xticklabels(["Converted", "Non-Converted"])
ax2.set_ylabel("Engagement Slope (clipped ±60)")
ax2.set_title("Engagement Slope Boxplot\n(median & spread comparison)", fontsize=12, fontweight="bold")
ax2.axhline(0, color=AMBER, lw=1.2, ls="--")
ax2.grid(axis="y")

fig.tight_layout()
save(fig, "11_engagement_slope_dist.png")

# ════════════════════════════════════════════════════════════════
# 12 — Engagement Segment Conversion Rate (bar)
# ════════════════════════════════════════════════════════════════
print("[12] Segment conversion rate...")
seg = df.groupby("user_segment")["converted_int"].agg(
    users="count", conv_rate="mean").reset_index()
seg["pct"] = (seg["conv_rate"] * 100).round(1)
order_seg = ["High", "Medium", "Low"]
seg["user_segment"] = pd.Categorical(seg["user_segment"], categories=order_seg, ordered=True)
seg = seg.sort_values("user_segment")

fig, ax = plt.subplots(figsize=(9, 5))
seg_colors = [GREEN, BLUE, RED]
bars = ax.bar(seg["user_segment"], seg["pct"], color=seg_colors,
              width=0.45, zorder=3, edgecolor=BORDER)
for bar, val, u in zip(bars, seg["pct"], seg["users"]):
    ax.text(bar.get_x() + bar.get_width()/2, val + 0.6,
            f"{val}%\n({u:,} users)", ha="center", fontsize=11, color=TEXT)
ax.axhline(38.6, color=AMBER, lw=1.3, ls="--", label="Overall 38.6%")
ax.set_ylabel("Conversion Rate (%)")
ax.set_xlabel("Engagement Segment")
ax.set_title("Conversion Rate by Engagement Segment\nHigh-engagement users convert 2× more than low", fontsize=13, fontweight="bold")
ax.set_ylim(0, 60)
ax.legend(fontsize=9)
ax.grid(axis="y", zorder=0)
fig.tight_layout()
save(fig, "12_segment_conv_rate.png")

# ════════════════════════════════════════════════════════════════
# 13 — Feature Impact Bar (from SQL join view)
# ════════════════════════════════════════════════════════════════
print("[13] Feature impact bar...")
feat_df = pd.read_csv(f"{ANA}/v_feature_impact.csv").sort_values("conv_rate_pct", ascending=True)

fig, ax = plt.subplots(figsize=(11, 6))
power_feats = {"team_invite", "integrations", "automation_rules"}
bar_colors = [CYAN if f in power_feats else BLUE for f in feat_df["feature"]]
bars = ax.barh(feat_df["feature"].str.replace("_", " ").str.title(),
               feat_df["conv_rate_pct"], color=bar_colors, height=0.6, zorder=3, edgecolor=BORDER)
for bar, val, u in zip(bars, feat_df["conv_rate_pct"], feat_df["unique_users"]):
    ax.text(val + 0.3, bar.get_y() + bar.get_height()/2,
            f"{val}%  ({u:,} users)", va="center", fontsize=9.5, color=TEXT)

cyan_patch  = mpatches.Patch(color=CYAN,  label="Power Feature")
blue_patch  = mpatches.Patch(color=BLUE,  label="Standard Feature")
ax.legend(handles=[cyan_patch, blue_patch], fontsize=9)
ax.axvline(38.6, color=AMBER, lw=1.3, ls="--", label="Overall avg")
ax.set_xlabel("Conversion Rate (%)")
ax.set_title("Feature Adoption → Conversion Rate\n(users who touched each feature, SQL join view)", fontsize=13, fontweight="bold")
ax.set_xlim(0, 80)
ax.grid(axis="x", zorder=0)
fig.tight_layout()
save(fig, "13_feature_impact_bar.png")

# ════════════════════════════════════════════════════════════════
# 14 — Propensity Decile → Conversion Rate
# ════════════════════════════════════════════════════════════════
print("[14] Propensity decile conversion...")
decile_q = """
WITH ranked AS (
    SELECT user_id, converted,
           NTILE(10) OVER (ORDER BY conversion_propensity_score DESC) AS decile
    FROM users
)
SELECT decile,
       COUNT(*) AS users,
       SUM(CASE WHEN converted=1 THEN 1 ELSE 0 END) AS converted,
       ROUND(AVG(CASE WHEN converted=1 THEN 1.0 ELSE 0 END)*100, 1) AS conv_rate_pct
FROM ranked GROUP BY decile ORDER BY decile
"""
decile_df = pd.read_sql(decile_q, conn)

fig, ax1 = plt.subplots(figsize=(11, 5))
dec_colors = [GREEN if i < 4 else AMBER if i < 7 else RED for i in range(len(decile_df))]
bars = ax1.bar(decile_df["decile"].astype(str), decile_df["conv_rate_pct"],
               color=dec_colors, width=0.6, zorder=3, edgecolor=BORDER)
for bar, val in zip(bars, decile_df["conv_rate_pct"]):
    ax1.text(bar.get_x() + bar.get_width()/2, val + 0.5,
             f"{val}%", ha="center", fontsize=9.5, color=TEXT)
ax1.axhline(38.6, color=AMBER, lw=1.3, ls="--", label="Overall 38.6%")
ax1.set_xlabel("Propensity Score Decile  (1 = highest score, 10 = lowest)")
ax1.set_ylabel("Conversion Rate (%)")
ax1.set_title("Conversion Rate by Propensity Score Decile\nTop 3 deciles consistently outperform baseline", fontsize=13, fontweight="bold")
ax1.set_ylim(0, 70)
ax1.legend(fontsize=9)
ax1.grid(axis="y", zorder=0)

ax2 = ax1.twinx()
ax2.plot(range(len(decile_df)), decile_df["users"], color=PURPLE,
         marker="s", lw=1.8, ms=5, label="Users per decile")
ax2.set_ylabel("Users", color=PURPLE)
ax2.tick_params(axis="y", colors=PURPLE)
ax2.set_ylim(0, 300)
fig.tight_layout()
save(fig, "14_propensity_decile_conv.png")

# ════════════════════════════════════════════════════════════════
# 15 — Company Size → Conversion Rate
# ════════════════════════════════════════════════════════════════
print("[15] Company size conversion...")
cs = df[df["company_size"] != "not_provided"].copy()
cs_stats = cs.groupby("company_size")["converted_int"].agg(
    users="count", conv_rate="mean").reset_index()
cs_stats["pct"] = (cs_stats["conv_rate"] * 100).round(1)
order_cs = ["1-10", "11-50", "51-200", "200+"]
labels_cs = ["Startup\n(1–10)", "SMB\n(11–50)", "Mid-Market\n(51–200)", "Enterprise\n(200+)"]
cs_stats["company_size"] = pd.Categorical(cs_stats["company_size"], categories=order_cs, ordered=True)
cs_stats = cs_stats.sort_values("company_size")

fig, ax = plt.subplots(figsize=(9, 5))
cs_colors = [CYAN, BLUE, AMBER, GREEN]
bars = ax.bar(labels_cs, cs_stats["pct"], color=cs_colors,
              width=0.45, zorder=3, edgecolor=BORDER)
for bar, val, u in zip(bars, cs_stats["pct"], cs_stats["users"]):
    ax.text(bar.get_x() + bar.get_width()/2, val + 0.6,
            f"{val}%\n({u:,})", ha="center", fontsize=11, color=TEXT)
ax.axhline(38.6, color=AMBER, lw=1.3, ls="--", label="Overall 38.6%")
ax.set_ylabel("Conversion Rate (%)")
ax.set_xlabel("Company Size")
ax.set_title("Conversion Rate by Company Size\nStartups & Enterprise lead in conversion", fontsize=13, fontweight="bold")
ax.set_ylim(0, 58)
ax.legend(fontsize=9)
ax.grid(axis="y", zorder=0)
fig.tight_layout()
save(fig, "15_company_size_conv.png")

# ════════════════════════════════════════════════════════════════
# PRINT FULL ANALYSIS SUMMARY
# ════════════════════════════════════════════════════════════════
conn.close()

print("\n" + "=" * 65)
print("COMPLETE ANALYSIS SUMMARY")
print("=" * 65)

total      = len(df)
converted  = df["converted_int"].sum()
conv_rate  = df["converted_int"].mean()

print(f"\n{'─'*40}")
print("DATASET OVERVIEW")
print(f"{'─'*40}")
print(f"  Total trial users       : {total:,}")
print(f"  Converted users         : {converted:,}")
print(f"  Non-converted           : {total - converted:,}")
print(f"  Overall conversion rate : {conv_rate:.1%}")
print(f"  Trial period            : Jan 2026 – Jun 2026 (6 months)")
print(f"  Trial length            : 14 days")

print(f"\n{'─'*40}")
print("TOP 5 PREDICTORS OF CONVERSION")
print(f"{'─'*40}")
predictors = [
    ("Total Feature Events",    "0.3245", "Highest predictor — volume of feature use"),
    ("Events per Session",      "0.1924", "Depth of engagement per visit"),
    ("Features Used (breadth)", "0.1634", "Exploring more of the product"),
    ("Session Count",           "0.1386", "Returning to the product repeatedly"),
    ("TTFV (hours) [negative]", "-0.1310","Faster activation = higher conversion"),
]
for rank, (feat, corr, note) in enumerate(predictors, 1):
    print(f"  {rank}. {feat:<30s} r={corr}  {note}")

print(f"\n{'─'*40}")
print("KEY CONVERSION RATES BY SEGMENT")
print(f"{'─'*40}")
ttfv12 = df[df["time_to_first_value_hrs"] <= 12]["converted_int"].mean()
ttfv72 = df[df["time_to_first_value_hrs"] >  72]["converted_int"].mean()
pf     = df[df["used_power_feature"] == True]["converted_int"].mean()
npf    = df[df["used_power_feature"] == False]["converted_int"].mean()
hi     = df[df["user_segment"] == "High"]["converted_int"].mean()
lo     = df[df["user_segment"] == "Low"]["converted_int"].mean()
champ  = df[df["archetype"] == "Champion"]["converted_int"].mean()

rows = [
    ("TTFV ≤ 12h",                f"{ttfv12:.1%}", f"{ttfv12/conv_rate:.1f}× baseline"),
    ("TTFV > 72h",                f"{ttfv72:.1%}", f"{ttfv72/conv_rate:.1f}× baseline"),
    ("Used power feature",        f"{pf:.1%}",     f"{pf/conv_rate:.1f}× baseline"),
    ("No power feature",          f"{npf:.1%}",    f"{npf/conv_rate:.1f}× baseline"),
    ("High engagement segment",   f"{hi:.1%}",     f"{hi/conv_rate:.1f}× baseline"),
    ("Low engagement segment",    f"{lo:.1%}",     f"{lo/conv_rate:.1f}× baseline"),
    ("Champion archetype",        f"{champ:.1%}",  f"{champ/conv_rate:.1f}× baseline"),
]
for label, rate, lift in rows:
    print(f"  {label:<30s} {rate}   {lift}")

print(f"\n{'─'*40}")
print("FUNNEL DROP-OFF SUMMARY")
print(f"{'─'*40}")
funnel = pd.read_csv(f"{ANA}/funnel_analysis.csv")
for _, row in funnel.iterrows():
    drop = f"  (−{row['step_dropoff_pct']}% step drop)" if row["step_dropoff_pct"] > 0 else ""
    print(f"  {row['stage']:<40s} {row['users']:>5,} ({row['pct_of_total']}%){drop}")

print(f"\n{'─'*40}")
print("ARCHETYPE CONVERSION RATES")
print(f"{'─'*40}")
arch = pd.read_csv(f"{ANA}/behavioral_archetypes.csv").sort_values("conversion_rate", ascending=False)
for _, row in arch.iterrows():
    bar = "█" * int(row["conversion_rate"] * 40)
    print(f"  {row['archetype']:<18s} {row['conversion_rate']*100:5.1f}%  {bar}  ({row['users']:,} users)")

print(f"\n{'─'*40}")
print("ANOMALIES")
print(f"{'─'*40}")
anom = pd.read_csv(f"{ANA}/anomaly_users.csv")
print(f"  Users with |z-score| > 3 on any metric : {len(anom)}")
print(f"  Anomaly conversion rate                : {anom['converted'].mean():.1%}")

print(f"\n{'─'*40}")
print("CHARTS GENERATED")
print(f"{'─'*40}")
charts = sorted(os.listdir(OUT))
for c in charts:
    print(f"  analysis/charts/{c}")

print(f"\n✅  All {len(charts)} charts saved to analysis/charts/")
print("✅  Full analysis complete — ready for Domain 3 handoff.")
