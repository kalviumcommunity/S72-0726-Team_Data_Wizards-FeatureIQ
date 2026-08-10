export interface UserRecord {
  user_id: string;
  signup_date: string;
  trial_end_date: string;
  company_size: string;
  industry: string;
  plan_interested: string;
  converted: boolean;
  upgrade_status: string;
  total_sessions: number;
  distinct_active_days: number;
  distinct_features_used: number;
  time_to_first_value_hrs: number;
  used_power_feature: boolean;
  engagement_slope: number;
  drop_off_stage: string;
  user_segment: 'High' | 'Medium' | 'Low';
  conversion_propensity_score: number;
}

export interface FunnelStage {
  id: string;
  name: string;
  stageNum: number;
  count: number;
  percentage: number;
  dropPercentage: number;
  droppedCount: number;
  passedPercentage: number;
  criteria: string;
  isBottleneck?: boolean;
}

export interface FeatureUsageMetric {
  feature: string;
  convertedAdoption: number; // percentage (0-100)
  nonConvertedAdoption: number; // percentage (0-100)
  avgActions: number;
  changePct: number;
  isPositive: boolean;
}

export interface FrictionPoint {
  id: string;
  title: string;
  stagePhase: string;
  impactLevel: 'High Impact' | 'Med Impact' | 'Low Impact';
  dropPct: number;
  description: string;
}

export interface LeadItem {
  id: string;
  name: string;
  email: string;
  signupDate: string;
  featuresUsed: string[];
  propensityScore: number;
  status: 'Hot' | 'Warm' | 'Cold';
  industry: string;
  plan: string;
}
