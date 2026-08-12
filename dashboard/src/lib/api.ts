import { UserRecord, LeadItem } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface BackendStatus {
  online: boolean;
  message: string;
  source: string;
  userCount: number;
}

export async function checkBackendStatus(): Promise<BackendStatus> {
  try {
    const res = await fetch(`${API_BASE}/test-db`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return {
        online: true,
        message: data.message || 'Connected to Express Real Data API',
        source: data.source || 'MySQL / CSV Data Engine',
        userCount: data.userCount || 2000,
      };
    }
  } catch (err) {
    // API server offline
  }

  return {
    online: false,
    message: 'Backend Service Disconnected',
    source: 'Offline',
    userCount: 0,
  };
}

export async function fetchUsersFromBackend(): Promise<{ users: UserRecord[]; status: BackendStatus }> {
  try {
    const res = await fetch(`${API_BASE}/users`, { cache: 'no-store' });
    if (res.ok) {
      const raw = await res.json();
      if (Array.isArray(raw) && raw.length > 0) {
        const users: UserRecord[] = raw.map((u: any) => ({
          user_id: u.user_id,
          signup_date: u.signup_date ? u.signup_date.substring(0, 10) : '2026-01-01',
          trial_end_date: u.trial_end_date ? u.trial_end_date.substring(0, 10) : '2026-01-15',
          company_size: u.company_size || '1-10',
          industry: u.industry || mapCompanySize(u.company_size),
          plan_interested: u.plan_interested || 'pro',
          converted: Boolean(u.converted),
          upgrade_status: u.converted ? 'Converted' : 'Trial Active',
          total_sessions: Number(u.total_sessions || 0),
          distinct_active_days: Number(u.distinct_active_days || 0),
          distinct_features_used: Number(u.distinct_features_used || 0),
          time_to_first_value_hrs: Number(u.time_to_first_value_hrs || 0),
          used_power_feature: Boolean(u.used_power_feature),
          engagement_slope: Number(u.engagement_slope || 0),
          drop_off_stage: u.drop_off_stage || 'completed_trial_window',
          user_segment: u.user_segment || (u.total_sessions >= 8 ? 'High' : u.total_sessions >= 4 ? 'Medium' : 'Low'),
          conversion_propensity_score: Number(u.conversion_propensity_score || 50),
          archetype: u.archetype || deriveArchetype(u),
          is_anomaly: Boolean(u.is_anomaly),
        }));

        return {
          users,
          status: {
            online: true,
            message: `Fetched ${users.length} real accounts from backend`,
            source: 'Express Real Data Service',
            userCount: users.length,
          },
        };
      }
    }
  } catch (error) {
    console.error('Failed to fetch real users from backend API:', error);
  }

  return {
    users: [],
    status: {
      online: false,
      message: 'Unable to reach backend API',
      source: 'Offline',
      userCount: 0,
    },
  };
}

export async function fetchMonthlyTrends(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/monthly-trends`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((d: any) => ({
          period: d.cohort_month ? formatPeriod(d.cohort_month) : d.period,
          signups: Number(d.signups || 0),
          conversions: Number(d.conversions || 0),
          rate: (Number(d.conversion_rate || 0) * 100).toFixed(1),
        }));
      }
    }
  } catch (e) {
    console.warn('Failed to fetch monthly trends from backend API');
  }
  return [];
}

export async function fetchFeatureImpact(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/feature-impact`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((d: any) => ({
          feature: formatFeatureName(d.feature),
          users: Number(d.unique_users || 0),
          totalUsageEvents: Number(d.total_usage_events || 0),
          convRatePct: Number(d.conv_rate_pct || 0),
          avgPropensity: Number(d.avg_propensity_score || 0),
          avgSessions: Number(d.avg_sessions || 0),
        }));
      }
    }
  } catch (e) {
    console.warn('Failed to fetch feature impact from backend API');
  }
  return [];
}

export async function fetchFunnelData(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/funnel`, { cache: 'no-store' });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Failed to fetch funnel data from backend API');
  }
  return [];
}

export async function fetchLeadsData(): Promise<LeadItem[]> {
  try {
    const res = await fetch(`${API_BASE}/leads`, { cache: 'no-store' });
    if (res.ok) {
      const raw = await res.json();
      if (Array.isArray(raw)) {
        return raw.map((u: any, i: number) => ({
          id: u.user_id,
          name: `Account #${u.user_id}`,
          email: `lead_${u.user_id.toLowerCase()}@saasclient.org`,
          signupDate: u.signup_date,
          featuresUsed: u.used_power_feature ? ['Integrations', 'Rules', 'Invites'] : ['Dashboard', 'Reports'],
          propensityScore: u.conversion_propensity_score,
          status: u.conversion_propensity_score >= 80 ? 'Hot' : u.conversion_propensity_score >= 60 ? 'Warm' : 'Cold',
          industry: u.industry || mapCompanySize(u.company_size),
          plan: (u.plan_interested || 'pro').toUpperCase(),
          archetype: u.archetype,
          isAnomaly: u.is_anomaly,
        }));
      }
    }
  } catch (e) {
    console.warn('Failed to fetch leads from backend API');
  }
  return [];
}

function formatPeriod(periodStr: string): string {
  if (periodStr.includes('-')) {
    const [year, month] = periodStr.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
  }
  return periodStr;
}

function formatFeatureName(feat: string): string {
  if (!feat) return 'Feature';
  return feat.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function mapCompanySize(size?: string): string {
  if (size === '200+') return 'Enterprise';
  if (size === '51-200') return 'Mid-Market SaaS';
  if (size === '11-50') return 'Growth / SMB';
  if (size === '1-10') return 'Startup / Seed';
  return 'Other / Unassigned';
}

function deriveArchetype(u: any): string {
  const power = Boolean(u.used_power_feature);
  const ttfv = Number(u.time_to_first_value_hrs || 24);
  const slope = Number(u.engagement_slope || 0);

  if (power && ttfv <= 12 && slope > 0) return 'Champion';
  if (power && ttfv <= 24) return 'Power Adopter';
  if (power && slope > 0) return 'Late Bloomer';
  if (slope > 0) return 'Growing Casual';
  if (u.total_sessions >= 3 && !power) return 'Plateaued User';
  if (u.total_sessions >= 1) return 'Window Shopper';
  return 'Ghost';
}
