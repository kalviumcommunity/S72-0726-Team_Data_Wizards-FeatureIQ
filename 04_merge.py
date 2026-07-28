"""
04_merge.py
Module 2.25: Multi-source merging & join validation.
Merges conversion (user roster), activity logs, and feature usage logs
into a single user-level base table. Proves the join behaved as expected
by checking row counts and unmatched keys before/after.
"""
import pandas as pd

PROC = "data/processed"

conv = pd.read_csv(f"{PROC}/conversion_clean.csv", parse_dates=["signup_date", "trial_end_date", "conversion_date"])
act = pd.read_csv(f"{PROC}/activity_clean.csv", parse_dates=["event_timestamp"])
usage = pd.read_csv(f"{PROC}/usage_clean.csv", parse_dates=["usage_timestamp"])

# ---------------------------------------------------------------
# Join validation BEFORE merging: who's missing from each side?
# ---------------------------------------------------------------
conv_users = set(conv["user_id"])
act_users = set(act["user_id"])
usage_users = set(usage["user_id"])

print(f"Users in conversion roster : {len(conv_users)}")
print(f"Users with activity logs   : {len(act_users)}  (missing: {len(conv_users - act_users)})")
print(f"Users with feature usage   : {len(usage_users)}  (missing: {len(conv_users - usage_users)})")

# Users with zero activity or zero feature usage are real signal (they exist,
# just never engaged) -- so we LEFT JOIN from conv, not inner join, and fill 0s later.

# ---------------------------------------------------------------
# Aggregate activity logs to user level
# ---------------------------------------------------------------
act_agg = act.groupby("user_id").agg(
    total_sessions=("event_timestamp", "count"),
    first_activity=("event_timestamp", "min"),
    last_activity=("event_timestamp", "max"),
    distinct_active_days=("event_date", "nunique"),
).reset_index()

# ---------------------------------------------------------------
# Aggregate feature usage to user level
# ---------------------------------------------------------------
usage_agg = usage.groupby("user_id").agg(
    distinct_features_used=("feature_name", "nunique"),
    total_feature_events=("usage_count", "sum"),
    first_feature_use=("usage_timestamp", "min"),
).reset_index()

# ---------------------------------------------------------------
# Merge — LEFT JOIN from conversion roster (the source of truth for who's a trial user)
# ---------------------------------------------------------------
merged = conv.merge(act_agg, on="user_id", how="left")
merged = merged.merge(usage_agg, on="user_id", how="left")

# validate row count didn't change (no fan-out from a bad join key)
assert len(merged) == len(conv), f"Row count changed after merge: {len(conv)} -> {len(merged)}"
assert merged["user_id"].is_unique, "Merge produced duplicate user_id rows"

# fill users with no engagement at all
merged["total_sessions"] = merged["total_sessions"].fillna(0)
merged["distinct_active_days"] = merged["distinct_active_days"].fillna(0)
merged["distinct_features_used"] = merged["distinct_features_used"].fillna(0)
merged["total_feature_events"] = merged["total_feature_events"].fillna(0)

merged.to_csv(f"{PROC}/merged_base.csv", index=False)
print(f"\nMerge complete: {merged.shape} -- row count preserved, no duplicate user_ids")
