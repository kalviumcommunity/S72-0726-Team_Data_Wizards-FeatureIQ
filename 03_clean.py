"""
03_clean.py
Modules 2.18-2.24:
  2.18 Missing value detection & imputation
  2.19 Data type enforcement & standardisation
  2.20 Duplicate detection & deduplication
  2.21 String cleaning & text normalisation
  2.22 Date/time transformation
  2.23 Outlier detection
  2.24 Data consistency & validation rules
"""
import pandas as pd
import numpy as np

RAW = "data/raw"
OUT = "data/processed"

# ---------------------------------------------------------------
# CONVERSION DATA
# ---------------------------------------------------------------
conv = pd.read_csv(f"{RAW}/conversion_data.csv")

# 2.20 dedup — exact duplicate rows, keep first
before = len(conv)
conv = conv.drop_duplicates(subset="user_id", keep="first")
print(f"conversion_data: dropped {before - len(conv)} duplicate users")

# 2.21 string normalisation
conv["plan_interested"] = conv["plan_interested"].str.lower().str.strip()
conv["company_size"] = conv["company_size"].replace("unknown", np.nan)

# 2.18 missing values
conv["company_size"] = conv["company_size"].fillna("not_provided")
# 'converted' nulls: since conversion_date is present/absent, back-fill from that instead of guessing
conv["converted"] = conv["converted"].astype(object)
conv.loc[conv["converted"].isna() & conv["conversion_date"].notna(), "converted"] = True
conv.loc[conv["converted"].isna() & conv["conversion_date"].isna(), "converted"] = False
conv["converted"] = conv["converted"].astype(bool)

# 2.19 dtype enforcement — handle mixed date formats (dd/mm/yyyy vs yyyy-mm-dd)
def parse_mixed_date(s):
    if pd.isna(s):
        return pd.NaT
    for fmt in ("%Y-%m-%d", "%d/%m/%Y"):
        try:
            return pd.to_datetime(s, format=fmt)
        except ValueError:
            continue
    return pd.NaT

conv["signup_date"] = conv["signup_date"].apply(parse_mixed_date)
conv["trial_end_date"] = pd.to_datetime(conv["trial_end_date"], format="%Y-%m-%d")
conv["conversion_date"] = conv["conversion_date"].apply(parse_mixed_date)

# 2.24 validation rules
bad_rows = conv[conv["conversion_date"] < conv["signup_date"]]
assert bad_rows.empty, "Validation failed: conversion_date before signup_date"
assert conv["user_id"].is_unique, "Validation failed: duplicate user_id after dedup"

conv.to_csv(f"{OUT}/conversion_clean.csv", index=False)

# ---------------------------------------------------------------
# ACTIVITY LOGS
# ---------------------------------------------------------------
act = pd.read_csv(f"{RAW}/activity_logs.csv")

before = len(act)
act = act.drop_duplicates()
print(f"activity_logs: dropped {before - len(act)} exact duplicate rows")

# 2.21 string normalisation — fix 'LOGIN ', 'Login', 'login' -> 'login'
act["event_type"] = act["event_type"].str.strip().str.lower()
act["device"] = act["device"].str.strip().str.lower()
act["device"] = act["device"].fillna("unknown")

# 2.22 date/time transform
act["event_timestamp"] = pd.to_datetime(act["event_timestamp"])
act["event_date"] = act["event_timestamp"].dt.date
act["event_hour"] = act["event_timestamp"].dt.hour

# 2.24 validation — event_type must be one of known values
valid_events = {"login", "logout", "page_view", "session_start", "session_end"}
bad = act[~act["event_type"].isin(valid_events)]
assert bad.empty, f"Validation failed: unexpected event_type values {bad['event_type'].unique()}"

act.to_csv(f"{OUT}/activity_clean.csv", index=False)

# ---------------------------------------------------------------
# FEATURE USAGE LOGS
# ---------------------------------------------------------------
usage = pd.read_csv(f"{RAW}/feature_usage_logs.csv")

before = len(usage)
usage = usage.drop_duplicates()
print(f"feature_usage_logs: dropped {before - len(usage)} exact duplicate rows")

# 2.21 normalise feature names ("Team Invite" -> "team_invite")
usage["feature_name"] = (
    usage["feature_name"].str.strip().str.lower().str.replace(" ", "_")
)

# 2.22 date transform
usage["usage_timestamp"] = pd.to_datetime(usage["usage_timestamp"])

# 2.23 outlier handling — cap usage_count at the 99th percentile instead of dropping rows
cap = usage["usage_count"].quantile(0.99)
n_capped = (usage["usage_count"] > cap).sum()
usage["usage_count"] = usage["usage_count"].clip(upper=cap)
print(f"feature_usage_logs: capped {n_capped} outlier rows at {cap:.0f} (99th pct)")

# 2.24 validation
assert (usage["usage_count"] > 0).all(), "Validation failed: non-positive usage_count found"

usage.to_csv(f"{OUT}/usage_clean.csv", index=False)

print("\nCleaning complete. Outputs in data/processed/:")
print(" - conversion_clean.csv:", conv.shape)
print(" - activity_clean.csv  :", act.shape)
print(" - usage_clean.csv     :", usage.shape)
