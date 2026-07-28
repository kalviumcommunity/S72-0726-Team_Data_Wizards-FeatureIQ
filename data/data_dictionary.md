# Data Dictionary — `clean_trial_users.csv`

**Grain:** one row per trial user (n=2000). Left-joined from the conversion roster, so every trial user appears exactly once, even if they never logged in or touched a feature.

| Column | Type | Description |
|---|---|---|
| `user_id` | string | Unique trial user identifier |
| `signup_date` | date | Trial start date |
| `trial_end_date` | date | Trial end date (signup + 14 days) |
| `company_size` | string | Self-reported company size band; `not_provided` where missing |
| `plan_interested` | string | Plan tier the user showed interest in at signup (starter/pro/business) |
| `converted` | bool | Ground truth label — did the user convert to paid |
| `conversion_date` | date | Date of conversion (null if not converted) |
| `total_sessions` | int | Total login/session events during the trial |
| `distinct_active_days` | int | Number of distinct calendar days with any activity |
| `distinct_features_used` | int | Count of unique product features touched |
| `total_feature_events` | int | Sum of all feature usage events (outlier-capped at 99th pct) |
| `time_to_first_value_hrs` | float | Hours from signup to first feature use; full trial length (336h) if never used a feature |
| `feature_adoption_breadth` | float (0-1) | `distinct_features_used` / total available features |
| `used_power_feature` | bool | Whether the user touched a high-signal feature (integrations, automation_rules, team_invite) |
| `session_frequency` | float | Sessions per active day |
| `engagement_slope` | int | Feature-usage volume in 2nd half of trial minus 1st half; positive = growing engagement |
| `drop_off_stage` | string | `never_active` / `early_dropoff` (≤day 3) / `mid_trial_dropoff` (≤day 8) / `completed_trial_window` |

## Known data-quality decisions made during cleaning
- Duplicate user rows in the raw conversion export were deduplicated on `user_id`, keeping the first record (30 dropped).
- Missing `converted` flags were back-filled using presence/absence of `conversion_date`.
- Mixed date formats (`YYYY-MM-DD` and `DD/MM/YYYY`) in raw signup dates were normalized.
- `event_type` and `feature_name` text was case- and whitespace-normalized (`'LOGIN '`, `'Login'`, `'login'` → `login`).
- Extreme `usage_count` outliers (bot/test accounts, values >500) were capped at the 99th percentile rather than dropped, to preserve the row for engagement-volume features.
- Users with zero activity or zero feature usage were kept (left join + 0-fill), since "never engaged" is itself a meaningful signal, not missing data to discard.

## Source files
- `conversion_data.csv` — trial roster + outcome
- `activity_logs.csv` — session/login event stream
- `feature_usage_logs.csv` — per-feature usage events

Pipeline: `01_generate_synthetic_data.py` → `02_profile.py` → `03_clean.py` → `04_merge.py` → `05_feature_engineering.py`
