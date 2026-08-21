import { FeatureUsageMetric, FrictionPoint } from './types';

export const FEATURE_METRICS: FeatureUsageMetric[] = [
  { feature: 'API Access', convertedAdoption: 84, nonConvertedAdoption: 32, avgActions: 42.5, changePct: 12, isPositive: true },
  { feature: 'Dashboards', convertedAdoption: 96, nonConvertedAdoption: 68, avgActions: 18.2, changePct: -5, isPositive: false },
  { feature: 'Export CSV', convertedAdoption: 78, nonConvertedAdoption: 42, avgActions: 8.4, changePct: 2, isPositive: true },
  { feature: 'Integrations', convertedAdoption: 72, nonConvertedAdoption: 25, avgActions: 14.6, changePct: 18, isPositive: true },
  { feature: 'Team Invites', convertedAdoption: 68, nonConvertedAdoption: 15, avgActions: 6.2, changePct: 24, isPositive: true },
];

export const FRICTION_POINTS: FrictionPoint[] = [
  {
    id: 'f-1',
    title: 'Credit Card Required',
    stagePhase: 'Occurs between Feature Act. and Paid.',
    impactLevel: 'High Impact',
    dropPct: 35,
    description: 'Mandatory payment step during upgrade friction causes steep churn among engaged users.'
  },
  {
    id: 'f-2',
    title: 'Complex Integration',
    stagePhase: 'Occurs during Onboarding phase.',
    impactLevel: 'Med Impact',
    dropPct: 18,
    description: 'Third-party webhook & OAuth setup requires developer assistance causing drop-off in Days 2–3.'
  },
  {
    id: 'f-3',
    title: 'Team Collaboration Barrier',
    stagePhase: 'Occurs during Feature Activation.',
    impactLevel: 'Med Impact',
    dropPct: 14,
    description: 'Solo users without team invites churn 2.8x faster than workspace teams.'
  }
];
