"""
05_feature_engineering.py
Module 2.26: Feature engineering & derived business columns.
Builds the behavioral features that Domain 2 (Pranathi) will use to
find what predicts conversion, and Domain 3 (Mallu) will surface on
the dashboard.
"""
import pandas as pd
import numpy as np

PROC = "/home/claude/data-foundation/data/processed"
usage = pd.read_csv(f"{PROC}/usage_clean.csv", parse_dates=["usage_timestamp"])
merged = pd.read_csv(
    f"{PROC}/merged_base.csv",
    parse_dates=["signup_date", "trial_end_date", "conversion_date", "first_activity", "last_activity", "first_feature_use"],
)

TRIAL_LENGTH_DAYS = 14
POWER_FEATURES = {"integrations", "automation_rules", "team_invite"}
ALL_FEATURES = [
    "dashboard", "reports", "api_access", "team_invite", "integrations",
    "export_csv", "custom_alerts", "billing_page", "advanced_search", "automation_rules",
]

# --- time_to_first_value: hours from signup to first feature use ---
merged["time_to_first_value_hrs"] = (
    (merged["first_feature_use"] - merged["signup_date"]).dt.total_seconds() / 3600
)
# users who never used a feature: treat as "no value reached" -> full trial length
merged["time_to_first_value_hrs"] = merged["time_to_first_value_hrs"].fillna(TRIAL_LENGTH_DAYS * 24)

# --- feature_adoption_breadth: fraction of all features tried ---
merged["feature_adoption_breadth"] = merged["distinct_features_used"] / len(ALL_FEATURES)

# --- power_feature_used: did they touch any of the high-signal features ---
power_users = usage[usage["feature_name"].isin(POWER_FEATURES)]["user_id"].unique()
merged["used_power_feature"] = merged["user_id"].isin(power_users)

# --- session_frequency: sessions per active trial day ---
merged["session_frequency"] = merged["total_sessions"] / merged["distinct_active_days"].replace(0, np.nan)
merged["session_frequency"] = merged["session_frequency"].fillna(0)

# --- engagement_slope: was usage growing or shrinking across the trial? ---
# compare feature-event volume in trial's first half vs second half, per user
usage_with_day = usage.merge(merged[["user_id", "signup_date"]], on="user_id", how="left")
usage_with_day["trial_day"] = (usage_with_day["usage_timestamp"] - usage_with_day["signup_date"]).dt.days
usage_with_day["half"] = np.where(usage_with_day["trial_day"] < TRIAL_LENGTH_DAYS / 2, "first_half", "second_half")

half_counts = usage_with_day.groupby(["user_id", "half"])["usage_count"].sum().unstack(fill_value=0)
half_counts = half_counts.reindex(columns=["first_half", "second_half"], fill_value=0)
half_counts["engagement_slope"] = half_counts["second_half"] - half_counts["first_half"]
merged = merged.merge(half_counts[["engagement_slope"]], on="user_id", how="left")
merged["engagement_slope"] = merged["engagement_slope"].fillna(0)

# --- drop_off_stage: last active trial day, bucketed ---
merged["last_active_trial_day"] = (merged["last_activity"] - merged["signup_date"]).dt.days
def bucket_dropoff(day):
    if pd.isna(day):
        return "never_active"
    if day <= 3:
        return "early_dropoff"
    if day <= 8:
        return "mid_trial_dropoff"
    return "completed_trial_window"
merged["drop_off_stage"] = merged["last_active_trial_day"].apply(bucket_dropoff)

# final column selection for handoff
handoff_cols = [
    "user_id", "signup_date", "trial_end_date", "company_size", "plan_interested",
    "converted", "conversion_date",
    "total_sessions", "distinct_active_days", "distinct_features_used", "total_feature_events",
    "time_to_first_value_hrs", "feature_adoption_breadth", "used_power_feature",
    "session_frequency", "engagement_slope", "drop_off_stage",
]
final = merged[handoff_cols]
final.to_csv(f"{PROC}/clean_trial_users.csv", index=False)

print("Feature engineering complete.")
print(final.head(3).to_string())
print(f"\nFinal handoff table: {final.shape}")
print(f"Conversion rate in dataset: {final['converted'].mean():.1%}")
