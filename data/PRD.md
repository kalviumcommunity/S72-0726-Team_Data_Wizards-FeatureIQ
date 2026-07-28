# PRD — Trial Conversion Insight Product

## Problem
Product managers have six months of trial activity, feature usage, and conversion data, but no workflow connecting behavior patterns to upgrade outcomes. Decisions are made on intuition.

## Goal
Give PMs a live view of which trial-user behaviors predict conversion, and flag at-risk / high-intent users while their trial is still active — not after it's over.

## Users
Product managers and growth team members monitoring active trial cohorts.

## Success Criteria
- Clear, validated list of behaviors correlated with conversion (e.g. power-feature usage, drop-off stage).
- A per-user signal PMs can act on before the trial ends.
- A dashboard, not a one-off report — usable every week on new trial cohorts.

## Scope (this sprint)
- **In:** clean unified dataset, behavioral feature engineering, correlation/segmentation analysis, SQL insight layer, Streamlit dashboard with alerts.
- **Out (future):** live production data pipeline, real ML model deployment, automated PM email nudges beyond a basic report.

## Data Sources
1. Conversion data — trial roster + outcome
2. Activity logs — session/login events
3. Feature usage logs — per-feature usage events

## Key Metrics to Surface
- Time-to-first-value
- Feature adoption breadth
- Power-feature usage
- Engagement slope (growing vs. shrinking usage across the trial)
- Drop-off stage
