"""
08_sql_layer.py
Domain 2 — SQL Metrics & Insight Layer (Pranathi)
Modules 2.37–2.44

2.37  SQL environment setup — SQLite DB, load tables
2.38  Core metrics queries (conversion rate, TTFV, feature usage)
2.39  Filtering & grouping queries
2.40  Multi-table joins (users + activity + usage)
2.41  Window functions — ranking, running totals, percentile bands
2.42  Query optimisation — index creation, query plans
2.43  SQL views — v_conversion_kpis, v_user_segments, v_feature_impact
2.44  Cross-validation: Python results vs SQL results

Outputs (written to analysis/):
  - featureiq.db              (SQLite database with all tables & views)
  - v_conversion_kpis.csv     (exported SQL view)
  - v_user_segments.csv       (exported SQL view)
  - v_feature_impact.csv      (exported SQL view)
  - sql_cross_validation.csv  (Python vs SQL agreement check)
"""

import sqlite3
import pandas as pd
import numpy as np
import os

PROC = "data/processed"
RAW  = "data/raw"
OUT  = "analysis"
DB   = f"{OUT}/featureiq.db"

os.makedirs(OUT, exist_ok=True)

# ------------------------------------------------------------------
# 2.37  Setup — load all tables into SQLite
# ------------------------------------------------------------------
print("=" * 65)
print("DOMAIN 2 — SQL LAYER")
print("=" * 65)
print("\n[2.37] Setting up SQLite database...")

conn = sqlite3.connect(DB)

# Load processed tables
users_df    = pd.read_csv(f"{PROC}/clean_trial_users_enriched.csv")
activity_df = pd.read_csv(f"{PROC}/activity_clean.csv")
usage_df    = pd.read_csv(f"{PROC}/usage_clean.csv")

users_df.to_sql("users",    conn, if_exists="replace", index=False)
activity_df.to_sql("activity", conn, if_exists="replace", index=False)
usage_df.to_sql("usage",    conn, if_exists="replace", index=False)

print(f"  Loaded tables: users ({len(users_df):,}), "
      f"activity ({len(activity_df):,}), usage ({len(usage_df):,})")


# ------------------------------------------------------------------
# 2.42  Indexes for query optimisation
# ------------------------------------------------------------------
print("\n[2.42] Creating indexes for query optimisation...")

index_statements = [
    "CREATE INDEX IF NOT EXISTS idx_users_user_id       ON users(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_users_converted     ON users(converted)",
    "CREATE INDEX IF NOT EXISTS idx_users_segment       ON users(user_segment)",
    "CREATE INDEX IF NOT EXISTS idx_activity_user_id    ON activity(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_usage_user_id       ON usage(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_usage_feature       ON usage(feature_name)",
]
for stmt in index_statements:
    conn.execute(stmt)
conn.commit()
print(f"  Created {len(index_statements)} indexes.")


# ------------------------------------------------------------------
# 2.38  Core metrics queries
# ------------------------------------------------------------------
print("\n[2.38] Core metrics queries...")

q_overall = """
SELECT
    COUNT(*)                                        AS total_users,
    SUM(CASE WHEN converted = 1 THEN 1 ELSE 0 END) AS total_converted,
    ROUND(AVG(CASE WHEN converted = 1 THEN 1.0 ELSE 0 END) * 100, 2)
                                                    AS overall_conv_rate_pct,
    ROUND(AVG(time_to_first_value_hrs), 2)          AS avg_ttfv_hrs,
    ROUND(AVG(total_sessions), 2)                   AS avg_sessions,
    ROUND(AVG(distinct_features_used), 2)           AS avg_features_used,
    ROUND(AVG(feature_adoption_breadth), 4)         AS avg_adoption_breadth
FROM users
"""
overall = pd.read_sql(q_overall, conn)
print("\n  Overall KPIs:")
print(overall.to_string(index=False))

q_power = """
SELECT
    used_power_feature,
    COUNT(*)                                                            AS users,
    ROUND(AVG(CASE WHEN converted=1 THEN 1.0 ELSE 0 END)*100, 2)      AS conv_rate_pct,
    ROUND(AVG(time_to_first_value_hrs), 2)                             AS avg_ttfv_hrs,
    ROUND(AVG(total_sessions), 2)                                      AS avg_sessions
FROM users
GROUP BY used_power_feature
"""
power = pd.read_sql(q_power, conn)
print("\n  Conversion by power feature usage:")
print(power.to_string(index=False))


# ------------------------------------------------------------------
# 2.39  Filtering & grouping
# ------------------------------------------------------------------
print("\n[2.39] Filtering & grouping queries...")

q_company = """
SELECT
    company_size,
    COUNT(*)                                                            AS users,
    ROUND(AVG(CASE WHEN converted=1 THEN 1.0 ELSE 0 END)*100, 2)      AS conv_rate_pct,
    ROUND(AVG(distinct_features_used), 2)                              AS avg_features,
    ROUND(AVG(total_sessions), 2)                                      AS avg_sessions
FROM users
WHERE company_size != 'not_provided'
GROUP BY company_size
ORDER BY conv_rate_pct DESC
"""
company = pd.read_sql(q_company, conn)
print("\n  Conversion by company size:")
print(company.to_string(index=False))

q_plan = """
SELECT
    plan_interested,
    COUNT(*)                                                            AS users,
    ROUND(AVG(CASE WHEN converted=1 THEN 1.0 ELSE 0 END)*100, 2)      AS conv_rate_pct,
    ROUND(AVG(conversion_propensity_score), 1)                        AS avg_propensity_score
FROM users
GROUP BY plan_interested
ORDER BY conv_rate_pct DESC
"""
plan = pd.read_sql(q_plan, conn)
print("\n  Conversion by plan interested:")
print(plan.to_string(index=False))

q_dropoff = """
SELECT
    drop_off_stage,
    COUNT(*)                                                            AS users,
    ROUND(AVG(CASE WHEN converted=1 THEN 1.0 ELSE 0 END)*100, 2)      AS conv_rate_pct,
    ROUND(AVG(total_sessions), 2)                                      AS avg_sessions,
    ROUND(AVG(engagement_slope), 2)                                    AS avg_slope
FROM users
GROUP BY drop_off_stage
ORDER BY conv_rate_pct DESC
"""
dropoff = pd.read_sql(q_dropoff, conn)
print("\n  Conversion by drop-off stage:")
print(dropoff.to_string(index=False))


# ------------------------------------------------------------------
# 2.40  Multi-table joins
# ------------------------------------------------------------------
print("\n[2.40] Multi-table join queries...")

q_feature_join = """
SELECT
    u.feature_name                                                       AS feature,
    COUNT(DISTINCT u.user_id)                                           AS unique_users,
    ROUND(AVG(us.total_sessions), 2)                                   AS avg_sessions,
    ROUND(AVG(CASE WHEN us.converted=1 THEN 1.0 ELSE 0 END)*100, 2)   AS conv_rate_pct,
    ROUND(SUM(u.usage_count), 0)                                        AS total_events
FROM usage u
JOIN users us ON u.user_id = us.user_id
GROUP BY u.feature_name
ORDER BY conv_rate_pct DESC
"""
feature_join = pd.read_sql(q_feature_join, conn)
print("\n  Feature usage → conversion (join query):")
print(feature_join.to_string(index=False))


# ------------------------------------------------------------------
# 2.41  Window functions
# ------------------------------------------------------------------
print("\n[2.41] Window function queries...")

q_window = """
SELECT
    user_id,
    conversion_propensity_score,
    converted,
    user_segment,
    archetype,
    RANK() OVER (ORDER BY conversion_propensity_score DESC)
                                                                        AS propensity_rank,
    NTILE(10) OVER (ORDER BY conversion_propensity_score DESC)
                                                                        AS propensity_decile,
    ROUND(
        AVG(conversion_propensity_score) OVER (
            PARTITION BY user_segment
        ), 2
    )                                                                   AS avg_score_in_segment,
    ROUND(
        SUM(CASE WHEN converted=1 THEN 1.0 ELSE 0 END) OVER (
            ORDER BY signup_date
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        )
        / COUNT(*) OVER (
            ORDER BY signup_date
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) * 100, 2
    )                                                                   AS running_conv_rate_pct
FROM users
ORDER BY propensity_rank
"""
window_df = pd.read_sql(q_window, conn)

# Save full ranked user table for handoff
window_df.to_csv(f"{OUT}/user_propensity_ranked.csv", index=False)
print(f"\n  Top 10 by propensity score:")
print(window_df.head(10)[["user_id", "propensity_rank", "propensity_decile",
                            "conversion_propensity_score", "converted",
                            "user_segment", "archetype"]].to_string(index=False))

# Decile conversion rates
q_decile = """
WITH ranked AS (
    SELECT
        user_id, converted,
        NTILE(10) OVER (ORDER BY conversion_propensity_score DESC) AS decile
    FROM users
)
SELECT
    decile,
    COUNT(*)                                                            AS users,
    SUM(CASE WHEN converted=1 THEN 1 ELSE 0 END)                      AS converted,
    ROUND(AVG(CASE WHEN converted=1 THEN 1.0 ELSE 0 END)*100, 2)      AS conv_rate_pct
FROM ranked
GROUP BY decile
ORDER BY decile
"""
decile_df = pd.read_sql(q_decile, conn)
print("\n  Conversion rate by propensity score decile (1=top):")
print(decile_df.to_string(index=False))


# ------------------------------------------------------------------
# 2.43  SQL Views
# ------------------------------------------------------------------
print("\n[2.43] Creating SQL views...")

# DROP and recreate views cleanly
views = {
    "v_conversion_kpis": """
        CREATE VIEW IF NOT EXISTS v_conversion_kpis AS
        SELECT
            user_segment,
            drop_off_stage,
            COUNT(*)                                                        AS total_users,
            SUM(CASE WHEN converted=1 THEN 1 ELSE 0 END)                  AS converted_users,
            ROUND(AVG(CASE WHEN converted=1 THEN 1.0 ELSE 0 END)*100, 2)  AS conv_rate_pct,
            ROUND(AVG(time_to_first_value_hrs), 2)                         AS avg_ttfv_hrs,
            ROUND(AVG(total_sessions), 2)                                  AS avg_sessions,
            ROUND(AVG(distinct_features_used), 2)                          AS avg_features_used,
            ROUND(AVG(conversion_propensity_score), 2)                     AS avg_propensity_score
        FROM users
        GROUP BY user_segment, drop_off_stage
        ORDER BY conv_rate_pct DESC
    """,
    "v_user_segments": """
        CREATE VIEW IF NOT EXISTS v_user_segments AS
        SELECT
            u.user_id,
            u.signup_date,
            u.company_size,
            u.plan_interested,
            u.converted,
            u.user_segment,
            u.archetype,
            u.drop_off_stage,
            u.total_sessions,
            u.distinct_features_used,
            u.time_to_first_value_hrs,
            u.used_power_feature,
            u.engagement_slope,
            u.feature_adoption_breadth,
            u.conversion_propensity_score,
            COUNT(DISTINCT act.event_date)                                 AS active_days_verified,
            COUNT(DISTINCT usg.feature_name)                               AS features_touched_verified
        FROM users u
        LEFT JOIN activity act ON u.user_id = act.user_id
        LEFT JOIN usage   usg ON u.user_id = usg.user_id
        GROUP BY u.user_id
    """,
    "v_feature_impact": """
        CREATE VIEW IF NOT EXISTS v_feature_impact AS
        SELECT
            usg.feature_name                                                AS feature,
            COUNT(DISTINCT usg.user_id)                                    AS unique_users,
            SUM(usg.usage_count)                                           AS total_usage_events,
            ROUND(AVG(CASE WHEN u.converted=1 THEN 1.0 ELSE 0 END)*100,2) AS conv_rate_pct,
            ROUND(AVG(u.conversion_propensity_score), 2)                   AS avg_propensity_score,
            ROUND(AVG(u.total_sessions), 2)                                AS avg_sessions
        FROM usage usg
        JOIN users u ON usg.user_id = u.user_id
        GROUP BY usg.feature_name
        ORDER BY conv_rate_pct DESC
    """,
}

for view_name, ddl in views.items():
    conn.execute(f"DROP VIEW IF EXISTS {view_name}")
    conn.execute(ddl)
conn.commit()
print(f"  Created views: {', '.join(views.keys())}")

# Export views to CSV for Mallu's handoff
for view_name in views.keys():
    view_df = pd.read_sql(f"SELECT * FROM {view_name}", conn)
    view_df.to_csv(f"{OUT}/{view_name}.csv", index=False)
    print(f"  Exported → analysis/{view_name}.csv  ({len(view_df)} rows)")


# ------------------------------------------------------------------
# 2.44  Cross-validation: Python results vs SQL results
# ------------------------------------------------------------------
print("\n[2.44] Cross-validation: Python vs SQL...")

# Load Python-computed KPIs from 07_analysis.py output
py_kpi = pd.read_csv(f"{OUT}/kpi_summary.csv")
py_overall_rate = py_kpi[py_kpi["kpi"] == "Overall"]["conversion_rate"].values[0]

# SQL overall conversion rate
sql_overall = pd.read_sql(
    "SELECT ROUND(AVG(CASE WHEN converted=1 THEN 1.0 ELSE 0 END), 6) AS rate FROM users",
    conn
)["rate"].values[0]

# Python segment rates
py_high  = py_kpi[py_kpi["kpi"] == "High Engagement Segment"]["conversion_rate"].values[0]
py_low   = py_kpi[py_kpi["kpi"] == "Low Engagement Segment"]["conversion_rate"].values[0]
py_power = py_kpi[py_kpi["kpi"] == "Used Power Feature"]["conversion_rate"].values[0]

# SQL segment rates
sql_segs = pd.read_sql("""
    SELECT user_segment,
           ROUND(AVG(CASE WHEN converted=1 THEN 1.0 ELSE 0 END), 6) AS rate
    FROM users GROUP BY user_segment
""", conn).set_index("user_segment")["rate"]

sql_power = pd.read_sql("""
    SELECT ROUND(AVG(CASE WHEN converted=1 THEN 1.0 ELSE 0 END), 6) AS rate
    FROM users WHERE used_power_feature=1
""", conn)["rate"].values[0]

cv_rows = [
    {"check": "Overall conversion rate",
     "python": round(py_overall_rate, 6), "sql": round(sql_overall, 6)},
    {"check": "High segment conv rate",
     "python": round(py_high, 6),  "sql": round(sql_segs.get("High",  0), 6)},
    {"check": "Low segment conv rate",
     "python": round(py_low, 6),   "sql": round(sql_segs.get("Low",   0), 6)},
    {"check": "Power feature conv rate",
     "python": round(py_power, 6), "sql": round(sql_power, 6)},
]

cv_df = pd.DataFrame(cv_rows)
cv_df["delta"]  = (cv_df["python"] - cv_df["sql"]).abs().round(8)
cv_df["match"]  = cv_df["delta"] < 1e-4

cv_df.to_csv(f"{OUT}/sql_cross_validation.csv", index=False)
print(cv_df.to_string(index=False))
all_match = cv_df["match"].all()
print(f"\n  Cross-validation {'PASSED ✓' if all_match else 'FAILED ✗'} "
      f"({'all' if all_match else 'some'} values agree within tolerance)")

conn.close()

print(f"\n[DONE] SQLite DB → {DB}")
print(f"[DONE] SQL views exported → {OUT}/")
print("\nHandoff files ready for Domain 3 (Mallu):")
print("  analysis/v_conversion_kpis.csv")
print("  analysis/v_user_segments.csv")
print("  analysis/v_feature_impact.csv")
print("  analysis/user_propensity_ranked.csv")
print("  analysis/featureiq.db")
