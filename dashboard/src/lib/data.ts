import { UserRecord, FeatureUsageMetric, FrictionPoint, LeadItem } from './types';

// All user data and leads are dynamically fetched from the Express Real Data Backend API (/api/users, /api/leads, /api/kpis)
export const RAW_USERS: UserRecord[] = [];
export const SAMPLE_LEADS: LeadItem[] = [];

export const FEATURE_METRICS: FeatureUsageMetric[] = [
  { feature: 'Integrations', convertedAdoption: 60.3, nonConvertedAdoption: 39.7, avgActions: 12.0, changePct: 20.3, isPositive: true },
  { feature: 'Automation Rules', convertedAdoption: 59.8, nonConvertedAdoption: 40.2, avgActions: 11.7, changePct: 19.5, isPositive: true },
  { feature: 'Team Invite', convertedAdoption: 57.9, nonConvertedAdoption: 42.1, avgActions: 11.3, changePct: 15.8, isPositive: true },
  { feature: 'Reports', convertedAdoption: 44.8, nonConvertedAdoption: 55.2, avgActions: 8.4, changePct: -10.4, isPositive: false },
  { feature: 'Custom Alerts', convertedAdoption: 44.8, nonConvertedAdoption: 55.2, avgActions: 8.3, changePct: -10.4, isPositive: false },
  { feature: 'API Access', convertedAdoption: 44.6, nonConvertedAdoption: 55.4, avgActions: 8.2, changePct: -10.8, isPositive: false },
  { feature: 'Advanced Search', convertedAdoption: 44.1, nonConvertedAdoption: 55.9, avgActions: 8.4, changePct: -11.8, isPositive: false },
  { feature: 'Billing Page', convertedAdoption: 44.0, nonConvertedAdoption: 56.0, avgActions: 8.5, changePct: -12.0, isPositive: false },
  { feature: 'Export CSV', convertedAdoption: 43.8, nonConvertedAdoption: 56.2, avgActions: 8.4, changePct: -12.4, isPositive: false },
  { feature: 'Dashboard', convertedAdoption: 43.6, nonConvertedAdoption: 56.4, avgActions: 8.2, changePct: -12.8, isPositive: false }
];

export const FRICTION_POINTS: FrictionPoint[] = [
  {
    id: 'f1',
    title: 'Trial Days 4–8 Flatline Bottleneck',
    stagePhase: 'Stage 3 → Stage 4 Drop-off',
    impactLevel: 'High Impact',
    dropPct: 51.6,
    description: 'Over 80% of un-converted users drop off during trial days 4–8 without executing a power feature.'
  },
  {
    id: 'f2',
    title: 'Delayed Speed-to-First-Value (>72 Hours)',
    stagePhase: 'Stage 1 → Stage 2 Onboarding',
    impactLevel: 'High Impact',
    dropPct: 23.5,
    description: 'Users who take longer than 72 hours to reach first feature execution convert at less than half the rate of <=12h activators.'
  },
  {
    id: 'f3',
    title: 'Single-Feature Usage Plateau',
    stagePhase: 'Stage 2 Onboarding',
    impactLevel: 'Med Impact',
    dropPct: 16.0,
    description: 'Users sticking exclusively to standard export/dashboard features show 21% baseline conversion.'
  }
];

export const BEHAVIORAL_ARCHETYPES = [
  { name: 'Champion', convRate: 70.2, count: 412, description: 'Fast TTFV (<=12h), touches power features, growing engagement slope.', color: '#00f2fe', badge: 'High-Value SDR Target' },
  { name: 'Power Adopter', convRate: 61.5, count: 328, description: 'Activates power features quickly, but usage flattens over time.', color: '#3b82f6', badge: 'Upgrade Candidate' },
  { name: 'Late Bloomer', convRate: 50.8, count: 245, description: 'Slow start (>24h TTFV), but eventually activates power features.', color: '#8b5cf6', badge: 'High Lift Potential' },
  { name: 'Growing Casual', convRate: 38.4, count: 310, description: 'Growing session volume, but stays within basic dashboard/export features.', color: '#10b981', badge: 'Feature Nudge Needed' },
  { name: 'Plateaued User', convRate: 28.1, count: 290, description: 'Active early, but flatlines in trial days 4-8 with no power feature.', color: '#f59e0b', badge: 'Re-engagement Alert' },
  { name: 'Window Shopper', convRate: 14.3, count: 265, description: 'Low session depth (1-2 sessions), never executes core workflow.', color: '#f43f5e', badge: 'Automated Nudge' },
  { name: 'Ghost', convRate: 4.8, count: 150, description: 'Zero or near-zero sessions after signup.', color: '#64748b', badge: 'Cold Account' }
];

export const ANALYSIS_CHARTS = [
  { id: 'chart-01', title: 'Overall Conversion Rate Overview', filename: '01_conversion_rate_overview.png', category: 'Conversion & Funnel', insight: 'Baseline SaaS free-trial conversion is 38.6% across 2,000 accounts.' },
  { id: 'chart-02', title: 'Time-To-First-Value (TTFV) Distribution', filename: '02_ttfv_distribution.png', category: 'Telemetry & Features', insight: 'Skews heavily towards early hours; median TTFV is 16.5 hours.' },
  { id: 'chart-03', title: 'TTFV Bucket vs Conversion Rate', filename: '03_ttfv_bucket_conv_rate.png', category: 'Telemetry & Features', insight: 'Users reaching TTFV <=12h convert at 56%, 2.4x higher than >72h (23%).' },
  { id: 'chart-04', title: 'Power Feature Conversion Lift', filename: '04_power_feature_conversion.png', category: 'Telemetry & Features', insight: 'Power feature users reach 43% conversion vs 21% for non-power feature users.' },
  { id: 'chart-05', title: 'Correlation Heatmap (Behavioral Features)', filename: '05_correlation_heatmap.png', category: 'Telemetry & Features', insight: 'TTFV (-0.42) and Propensity Score (+0.68) show strongest correlation with conversion.' },
  { id: 'chart-06', title: 'Feature Conversion Lift Matrix', filename: '06_feature_lift.png', category: 'Telemetry & Features', insight: 'Automation Rules (+21.5%) and Team Invites (+19.8%) deliver highest upgrade lift.' },
  { id: 'chart-07', title: 'Monthly Cohort Conversion Trend', filename: '07_monthly_cohort_trend.png', category: 'Conversion & Funnel', insight: 'Conversion rate steadily improved from 34.5% in Jan to 38.6% in Jun.' },
  { id: 'chart-08', title: 'Behavioral Archetype Breakdown', filename: '08_archetype_breakdown.png', category: 'Archetypes & Segments', insight: 'Champions & Power Adopters account for over 65% of total paid conversions.' },
  { id: 'chart-09', title: '4-Stage Conversion Funnel Flow', filename: '09_funnel_chart.png', category: 'Conversion & Funnel', insight: 'Stage 3 to Stage 4 exhibits peak drop-off (51.6% bottleneck).' },
  { id: 'chart-10', title: 'Drop-off Stage Conversion Analysis', filename: '10_dropoff_stage_conv.png', category: 'Conversion & Funnel', insight: '82.4% of un-converted trial accounts drop off between Days 4 and 8.' },
  { id: 'chart-11', title: 'Engagement Slope Distribution', filename: '11_engagement_slope_dist.png', category: 'Telemetry & Features', insight: 'Positive engagement slope accounts convert at 47% vs 31% for negative slope.' },
  { id: 'chart-12', title: 'User Segment Conversion Rates', filename: '12_segment_conv_rate.png', category: 'Archetypes & Segments', insight: 'High-Engagement segment converts at 58.4% vs 18.1% for Low-Engagement.' },
  { id: 'chart-13', title: 'Feature Impact & Usage Bar Chart', filename: '13_feature_impact_bar.png', category: 'Telemetry & Features', insight: 'API Access and Custom Alerts drive high retention among enterprise signups.' },
  { id: 'chart-14', title: 'Propensity Decile Conversion Velocity', filename: '14_propensity_decile_conv.png', category: 'Propensity & Size', insight: 'Top decile (score 90-99) achieves 91.2% conversion rate.' },
  { id: 'chart-15', title: 'Company Size Conversion Performance', filename: '15_company_size_conv.png', category: 'Propensity & Size', insight: 'Enterprise accounts (200+) lead in plan interest and conversion velocity.' }
];
