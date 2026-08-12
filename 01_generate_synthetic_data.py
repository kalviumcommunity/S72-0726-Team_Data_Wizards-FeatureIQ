"""
01_generate_synthetic_data.py
Generates 6 months of synthetic SaaS trial data across three raw sources:
  - conversion_data.csv     (trial user roster + conversion outcome)
  - activity_logs.csv       (login/session event stream)
  - feature_usage_logs.csv  (per-feature usage events)

Deliberately injects realistic messiness (nulls, dupes, mixed casing,
outliers, mixed date formats) so the cleaning steps in 02-04 have real
work to do.
"""
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import random
import os

os.makedirs("data/raw", exist_ok=True)

np.random.seed(42)
random.seed(42)

N_USERS = 2000
TRIAL_LENGTH_DAYS = 14
START_DATE = datetime(2026, 1, 1)
END_DATE = datetime(2026, 6, 30)

FEATURES = [
    "dashboard", "reports", "api_access", "team_invite", "integrations",
    "export_csv", "custom_alerts", "billing_page", "advanced_search", "automation_rules"
]
# a couple of "power features" that will be made to correlate with conversion
POWER_FEATURES = {"integrations", "automation_rules", "team_invite"}

PLANS = ["starter", "pro", "business"]

# ---------------------------------------------------------------
# 1. Trial user roster + conversion outcome
# ---------------------------------------------------------------
users = []
for i in range(1, N_USERS + 1):
    trial_start = START_DATE + timedelta(days=random.randint(0, (END_DATE - START_DATE).days - TRIAL_LENGTH_DAYS))
    # engagement propensity drives both activity volume AND conversion (ground truth signal)
    engagement_propensity = np.random.beta(2, 3)
    converted = np.random.rand() < (0.15 + engagement_propensity * 0.55)
    users.append({
        "user_id": f"U{i:05d}",
        "signup_date": trial_start.strftime("%Y-%m-%d") if i % 7 != 0 else trial_start.strftime("%d/%m/%Y"),  # mixed date format
        "trial_end_date": (trial_start + timedelta(days=TRIAL_LENGTH_DAYS)).strftime("%Y-%m-%d"),
        "company_size": random.choice(["1-10", "11-50", "51-200", "200+", None, "unknown"]),
        "plan_interested": random.choice(PLANS + [p.upper() for p in PLANS]),  # inconsistent casing
        "converted": converted,
        "conversion_date": (trial_start + timedelta(days=random.randint(5, TRIAL_LENGTH_DAYS))).strftime("%Y-%m-%d") if converted else None,
        "_engagement_propensity": engagement_propensity,  # hidden ground-truth, dropped later
    })

conversion_df = pd.DataFrame(users)

# inject duplicates
dupes = conversion_df.sample(30, random_state=1)
conversion_df = pd.concat([conversion_df, dupes], ignore_index=True)
# inject some missing conversion flags (bad export)
conversion_df["converted"] = conversion_df["converted"].astype(object)
mask = conversion_df.sample(frac=0.02, random_state=2).index
conversion_df.loc[mask, "converted"] = None

conversion_df_public = conversion_df.drop(columns=["_engagement_propensity"])
conversion_df_public.to_csv("data/raw/conversion_data.csv", index=False)

# ---------------------------------------------------------------
# 2. Activity logs (session-level events)
# ---------------------------------------------------------------
EVENT_TYPES = ["login", "Login", "LOGIN ", "session_start", "session_end", "page_view", "logout"]
activity_rows = []
for u in users:
    n_sessions = max(1, int(np.random.poisson(2 + u["_engagement_propensity"] * 10)))
    trial_start = datetime.strptime(u["signup_date"], "%Y-%m-%d") if "/" not in u["signup_date"] else datetime.strptime(u["signup_date"], "%d/%m/%Y")
    for _ in range(n_sessions):
        ts = trial_start + timedelta(days=random.randint(0, TRIAL_LENGTH_DAYS), hours=random.randint(0, 23), minutes=random.randint(0, 59))
        activity_rows.append({
            "user_id": u["user_id"],
            "event_timestamp": ts.strftime("%Y-%m-%d %H:%M:%S"),
            "event_type": random.choice(EVENT_TYPES),  # messy casing/whitespace on purpose
            "device": random.choice(["web", "mobile", "Web", None]),
        })

activity_df = pd.DataFrame(activity_rows)
# duplicate a chunk of rows (double-logged events)
activity_df = pd.concat([activity_df, activity_df.sample(frac=0.01, random_state=3)], ignore_index=True)
activity_df.to_csv("data/raw/activity_logs.csv", index=False)

# ---------------------------------------------------------------
# 3. Feature usage logs
# ---------------------------------------------------------------
usage_rows = []
for u in users:
    trial_start = datetime.strptime(u["signup_date"], "%Y-%m-%d") if "/" not in u["signup_date"] else datetime.strptime(u["signup_date"], "%d/%m/%Y")
    n_features_used = np.random.binomial(len(FEATURES), 0.2 + u["_engagement_propensity"] * 0.6)
    used_features = random.sample(FEATURES, k=max(1, n_features_used))
    for f in used_features:
        n_events = np.random.poisson(1 + u["_engagement_propensity"] * 5)
        # power features get an extra usage boost for engaged/converting users -> real signal to discover later
        if f in POWER_FEATURES and u["converted"]:
            n_events += np.random.poisson(3)
        for _ in range(max(1, n_events)):
            ts = trial_start + timedelta(days=random.randint(0, TRIAL_LENGTH_DAYS), hours=random.randint(0, 23))
            usage_rows.append({
                "user_id": u["user_id"],
                "feature_name": f if random.random() > 0.05 else f.replace("_", " ").title(),  # messy naming
                "usage_timestamp": ts.strftime("%Y-%m-%d %H:%M:%S"),
                "usage_count": np.random.randint(1, 5),
            })

usage_df = pd.DataFrame(usage_rows)
# inject a few extreme outliers (bot/test accounts)
outlier_idx = usage_df.sample(5, random_state=4).index
usage_df.loc[outlier_idx, "usage_count"] = np.random.randint(500, 2000, size=5)
usage_df.to_csv("data/raw/feature_usage_logs.csv", index=False)

print("Generated raw files:")
print(f"  conversion_data.csv    : {conversion_df_public.shape}")
print(f"  activity_logs.csv      : {activity_df.shape}")
print(f"  feature_usage_logs.csv : {usage_df.shape}")
