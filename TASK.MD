# SaaS Trial Conversion — Data Product Plan
**Kalvium Module 2: End-to-End Data Product (Dataset to Insights)**

## Problem Statement
A SaaS company has six months of free trial user activity, feature usage logs, and subscription conversion data, yet product managers still rely on intuition because no workflow connects user behaviour patterns to successful upgrades.

## Team & Domain Ownership

| Domain | Owner | Modules | Deliverable |
|---|---|---|---|
| 1 — Data Foundation & Cleaning | **Vansh** | 2.1–2.26 | Clean merged dataset + PRD + data dictionary |
| 2 — Analysis, SQL & Insight Layer | **Pranathi** | 2.27–2.44 | Validated behavioral insights + SQL views + conversion scores |
| 3 — Visualization, Product App & Delivery | **Mallu** | 2.45–2.60 | Working Streamlit dashboard + docs |

**Rule:** each person owns exactly one domain. No cross-domain work. Handoffs happen through the shared repo (files/SQL views), not verbally.

---

## Domain 1 — Data Foundation & Cleaning (Vansh)

**Goal:** turn raw activity logs, feature usage logs, and conversion data into one clean, feature-rich dataset.

| Step | Module(s) | Task |
|---|---|---|
| 1 | 2.1, 2.9, 2.10 | Sprint kickoff, write PRD, wireframe PM dashboard (share with team day 1) |
| 2 | 2.11–2.13 | Repo setup: venv, GitHub structure, branches, script layout |
| 3 | 2.14–2.19 | Ingest CSV/JSON sources, profile data quality, write data dictionary, fix missing values, enforce types |
| 4 | 2.20–2.21 | Deduplicate records, clean/normalize text fields |
| 5 | 2.22–2.24 | Build time-based features, handle outliers, add validation rules |
| 6 | 2.25 | Merge all 3 sources into one unified user-timeline table |
| 7 | 2.26 | Feature engineering: time-to-first-value, feature adoption breadth, engagement slope, session frequency, drop-off stage |

**Handoff to Pranathi:**
- `clean_trial_users.csv` — one row per user, engineered features included
- `data_dictionary.md` — every column explained
- Repo folder structure ready for the team

---

## Domain 2 — Analysis, SQL & Insight Layer (Pranathi)

**Goal:** prove which behaviors actually predict conversion.

**Parallel prep (can start immediately, no dependency):** 2.7, 2.37 — SQL environment setup and practice queries on dummy data.

| Step | Module(s) | Task |
|---|---|---|
| 1 | 2.27–2.29 | Vectorized computation, distribution analysis, correlation analysis |
| 2 | 2.30–2.31 | GroupBy segment comparisons (converters vs. non-converters), time-series/rolling trends |
| 3 | 2.32–2.33 | Behavioral segmentation (user archetypes), funnel/drop-off analysis |
| 4 | 2.34–2.36 | KPI definition, root cause investigation, anomaly detection |
| 5 | 2.38–2.44 | SQL metrics queries, filtering/grouping, joins, window functions, query optimization, views, cross-validation vs. Python results |

**Handoff to Mallu:**
- Written insights (e.g. "users who use Feature X within 48hrs convert at 3x rate")
- SQL views (`v_conversion_kpis`, `v_user_segments`) ready to query
- Conversion-propensity score/ranking per user

---

## Domain 3 — Visualization, Product App & Delivery (Mallu)

**Goal:** turn insights into a working PM-facing tool.

**Parallel prep (can start immediately, no dependency):** 2.45–2.47, 2.51 — viz principles, Plotly practice, KPI card design, Streamlit app shell with dummy data.

| Step | Module(s) | Task |
|---|---|---|
| 1 | 2.48–2.50 | Data storytelling, executive summary writing, insight export |
| 2 | 2.52–2.56 | Dataset upload/preview, interactive filters, session state, real-time KPI dashboard, alert thresholds |
| 3 | 2.57–2.58 | Email/report sharing integration, automated daily pipeline run |
| 4 | 2.59–2.60 | GitHub Actions CI validation, final documentation |

**Final deliverable:** the working Streamlit app — this is the demo.

---

## Timeline

```
Week 1        Week 2           Week 3           Week 4
[Domain 1]───▶[Domain 1 done]
               [Domain 2 starts]───▶[Domain 2 done]
                                     [Domain 3 starts]───▶[Domain 3 done]
                                                            [Integration + Demo]
```

Pranathi and Mallu do parallel prep work during weeks they'd otherwise be idle, then switch to real data once the prior domain's handoff lands.

## Ground Rules

- All handoffs = files or SQL views in the shared repo, not verbal.
- No one touches another domain's modules — early finishers do parallel prep or polish their own domain.
- Vansh sets repo structure (`/data-foundation`, `/analysis`, `/app`) since Domain 1 runs first.