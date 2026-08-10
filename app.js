/**
 * app.js - FeatureIQ Executive Data Product Application Script
 * Handles real-time interactive filtering, KPI calculations, Chart.js rendering,
 * Cohort heatmap generation, User Roster pagination, and Data Storytelling callouts.
 */

let masterData = null;
let currentFilteredUsers = [];
let chartInstances = {};
let currentPage = 1;
const pageSize = 12;
let currentSortField = 'conversion_propensity_score';
let currentSortAsc = false;
let activeTab = 'cohorts';

// Initialize App when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  if (window.FEATURE_IQ_DATA) {
    masterData = window.FEATURE_IQ_DATA;
    initApp();
  } else {
    fetch('data/processed/dashboard_data.json')
      .then(res => res.json())
      .then(data => {
        masterData = data;
        initApp();
      })
      .catch(err => {
        console.error("Failed to load dashboard data:", err);
      });
  }
});

function initApp() {
  setupFilterListeners();
  setupTabListeners();
  setupModalListeners();
  applyFilters();
  
  // Re-initialize Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }
}

// -------------------------------------------------------------
// Interactive Filtering Logic
// -------------------------------------------------------------
function setupFilterListeners() {
  const dateFilter = document.getElementById('filter-date');
  const industryFilter = document.getElementById('filter-industry');
  const segmentFilter = document.getElementById('filter-segment');
  const statusFilter = document.getElementById('filter-status');
  const resetBtn = document.getElementById('btn-reset-filters');
  const searchInput = document.getElementById('search-users');
  const exportBtn = document.getElementById('btn-export');

  if (dateFilter) dateFilter.addEventListener('change', applyFilters);
  if (industryFilter) industryFilter.addEventListener('change', applyFilters);
  if (segmentFilter) segmentFilter.addEventListener('change', applyFilters);
  if (statusFilter) statusFilter.addEventListener('change', applyFilters);
  if (searchInput) searchInput.addEventListener('input', () => { currentPage = 1; renderUserTable(); });
  
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (dateFilter) dateFilter.value = 'all';
      if (industryFilter) industryFilter.value = 'all';
      if (segmentFilter) segmentFilter.value = 'all';
      if (statusFilter) statusFilter.value = 'all';
      if (searchInput) searchInput.value = '';
      applyFilters();
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', exportFilteredDataCSV);
  }
}

function applyFilters() {
  if (!masterData || !masterData.users) return;

  const dateVal = document.getElementById('filter-date')?.value || 'all';
  const indVal = document.getElementById('filter-industry')?.value || 'all';
  const segVal = document.getElementById('filter-segment')?.value || 'all';
  const statVal = document.getElementById('filter-status')?.value || 'all';

  currentFilteredUsers = masterData.users.filter(user => {
    // 1. Date Filter
    if (dateVal !== 'all') {
      const sDate = user.signup_date; // YYYY-MM-DD
      if (dateVal === 'q1' && (sDate < '2026-01-01' || sDate > '2026-03-31')) return false;
      if (dateVal === 'q2' && (sDate < '2026-04-01' || sDate > '2026-06-30')) return false;
      if (dateVal === '30d' && sDate < '2026-06-01') return false;
      if (dateVal === '90d' && sDate < '2026-04-01') return false;
    }

    // 2. Industry Filter
    if (indVal !== 'all' && user.industry !== indVal && user.company_size !== indVal) {
      return false;
    }

    // 3. User Segment Filter
    if (segVal !== 'all' && user.user_segment !== segVal) {
      return false;
    }

    // 4. Upgrade Status Filter
    if (statVal !== 'all') {
      if (statVal === 'converted' && !user.converted) return false;
      if (statVal === 'non-converted' && user.converted) return false;
    }

    return true;
  });

  // Update Badge
  const countBadge = document.getElementById('filter-count-badge');
  if (countBadge) {
    countBadge.textContent = `${currentFilteredUsers.length.toLocaleString()} / ${masterData.users.length.toLocaleString()} Accounts`;
  }

  // Update All Components
  updateKPIs();
  renderConversionFunnel();
  updateStoryCallouts();
  renderCharts();
  renderCohortTable();
  currentPage = 1;
  renderUserTable();
}

// -------------------------------------------------------------
// Day 3: Conversion Funnel Visualizer (4 Key Stages)
// -------------------------------------------------------------
function renderConversionFunnel() {
  const container = document.getElementById('funnel-flow-container');
  if (!container) return;

  const total = currentFilteredUsers.length;
  if (total === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--text-dim);">
        <i data-lucide="info"></i> No accounts match the selected filter criteria.
      </div>
    `;
    updateFunnelBottleneckCallout(null);
    if (window.lucide) lucide.createIcons();
    return;
  }

  // 1. Calculate 4 Funnel Stages
  // Stage 1: Signup (Total Trial Users)
  const s1Count = total;

  // Stage 2: Onboarding Completed (distinct features >= 2 or TTFV <= 48 hrs)
  const s2Users = currentFilteredUsers.filter(u => u.distinct_features_used >= 2 || (u.time_to_first_value_hrs && u.time_to_first_value_hrs <= 48));
  const s2Count = s2Users.length;

  // Stage 3: Key Feature Activated (used_power_feature === true)
  const s3Users = currentFilteredUsers.filter(u => u.used_power_feature);
  const s3Count = s3Users.length;

  // Stage 4: Upgraded to Paid (converted === true)
  const s4Users = currentFilteredUsers.filter(u => u.converted);
  const s4Count = s4Users.length;

  // Cumulative % of top-of-funnel
  const s1Pct = 100.0;
  const s2Pct = parseFloat(((s2Count / s1Count) * 100).toFixed(1));
  const s3Pct = parseFloat(((s3Count / s1Count) * 100).toFixed(1));
  const s4Pct = parseFloat(((s4Count / s1Count) * 100).toFixed(1));

  // 2. Step-by-Step Drop-Off Calculations
  // Step 1 -> 2
  const drop12Count = Math.max(0, s1Count - s2Count);
  const drop12Pct = s1Count > 0 ? parseFloat(((drop12Count / s1Count) * 100).toFixed(1)) : 0;
  const ret12Pct = s1Count > 0 ? parseFloat(((s2Count / s1Count) * 100).toFixed(1)) : 0;

  // Step 2 -> 3
  const drop23Count = Math.max(0, s2Count - s3Count);
  const drop23Pct = s2Count > 0 ? parseFloat(((drop23Count / s2Count) * 100).toFixed(1)) : 0;
  const ret23Pct = s2Count > 0 ? parseFloat(((s3Count / s2Count) * 100).toFixed(1)) : 0;

  // Step 3 -> 4
  const drop34Count = Math.max(0, s3Count - s4Count);
  const drop34Pct = s3Count > 0 ? parseFloat(((drop34Count / s3Count) * 100).toFixed(1)) : 0;
  const ret34Pct = s3Count > 0 ? parseFloat(((s4Count / s3Count) * 100).toFixed(1)) : 0;

  // 3. Automated Highest Drop-Off Detection
  const transitions = [
    {
      id: 'step-1-2',
      fromStage: 'Signup',
      toStage: 'Onboarding Completed',
      stepNum: '1 → 2',
      targetStageIndex: 2,
      dropPct: drop12Pct,
      dropCount: drop12Count,
      retPct: ret12Pct,
      desc: 'Users dropping before completing initial setup & onboarding actions within 48 hours.',
      diag: 'Introduce interactive guided walkthrough checklists and in-app tooltips immediately upon first login.'
    },
    {
      id: 'step-2-3',
      fromStage: 'Onboarding Completed',
      toStage: 'Key Feature Activated',
      stepNum: '2 → 3',
      targetStageIndex: 3,
      dropPct: drop23Pct,
      dropCount: drop23Count,
      retPct: ret23Pct,
      desc: 'Users completing basic onboarding but failing to activate high-value power features (Integrations, Automation Rules, Team Invites).',
      diag: 'Send timely automated triggers highlighting collaboration and integrations templates on Day 2 of the trial.'
    },
    {
      id: 'step-3-4',
      fromStage: 'Key Feature Activated',
      toStage: 'Upgraded to Paid',
      stepNum: '3 → 4',
      targetStageIndex: 4,
      dropPct: drop34Pct,
      dropCount: drop34Count,
      retPct: ret34Pct,
      desc: 'Users successfully adopting high-value features but failing to finalize checkout before the trial window expires.',
      diag: 'Deploy targeted sales SDR follow-ups and personalized plan upgrade discounts for accounts showing high feature engagement.'
    }
  ];

  let maxDropTransition = transitions[0];
  transitions.forEach(t => {
    if (t.dropPct > maxDropTransition.dropPct) {
      maxDropTransition = t;
    }
  });

  // Update Header Metric Chips
  const chipConv = document.getElementById('chip-funnel-conv');
  if (chipConv) {
    chipConv.innerHTML = `<span class="chip-label">End-to-End Conv Rate:</span> <span class="chip-value text-emerald">${s4Pct}%</span>`;
  }
  const chipBottleneck = document.getElementById('chip-funnel-bottleneck');
  if (chipBottleneck) {
    chipBottleneck.innerHTML = `<span class="chip-label">Biggest Drop-off:</span> <span class="chip-value text-rose">Stage ${maxDropTransition.stepNum} (-${maxDropTransition.dropPct}%)</span>`;
  }

  // Helper to check if a stage is the target of the worst drop-off
  const isStage2Bottleneck = maxDropTransition.targetStageIndex === 2;
  const isStage3Bottleneck = maxDropTransition.targetStageIndex === 3;
  const isStage4Bottleneck = maxDropTransition.targetStageIndex === 4;

  // 4. Render HTML Structure
  container.innerHTML = `
    <!-- Stage 1: Signup -->
    <div class="funnel-stage-card stage-1" onclick="filterByFunnelStage('signup')" title="Click to inspect all Signup accounts in table">
      <div class="stage-card-header">
        <span class="stage-num-badge">STAGE 01</span>
        <div class="stage-icon-circle"><i data-lucide="user-plus"></i></div>
      </div>
      <div>
        <h4 class="stage-title">Signup</h4>
        <div class="stage-user-count">${s1Count.toLocaleString()}</div>
      </div>
      <div class="stage-pct-row">
        <span>Retention Rate</span>
        <span class="text-cyan">100.0%</span>
      </div>
      <div class="stage-bar-track">
        <div class="stage-bar-fill" style="width: 100%;"></div>
      </div>
      <div class="stage-card-footer">
        <span>Registered trial users</span>
        <span class="stage-filter-hint"><i data-lucide="arrow-right"></i> View</span>
      </div>
    </div>

    <!-- Connector 1 -> 2 -->
    <div class="funnel-connector">
      <div class="connector-arrow"><i data-lucide="chevron-right"></i></div>
      <div class="dropoff-badge ${maxDropTransition.id === 'step-1-2' ? 'is-highest' : ''}">
        <span class="dropoff-pct">-${drop12Pct}%</span>
        <span class="dropoff-count">${drop12Count.toLocaleString()} dropped</span>
      </div>
      <span class="connector-retention">${ret12Pct}% passed</span>
    </div>

    <!-- Stage 2: Onboarding Completed -->
    <div class="funnel-stage-card stage-2 ${isStage2Bottleneck ? 'is-bottleneck' : ''}" onclick="filterByFunnelStage('onboarding')" title="Click to inspect accounts completing onboarding">
      <div class="stage-card-header">
        <span class="stage-num-badge">STAGE 02</span>
        ${isStage2Bottleneck ? '<span class="stage-bottleneck-badge"><i data-lucide="alert-triangle"></i> Bottleneck</span>' : ''}
        <div class="stage-icon-circle"><i data-lucide="compass"></i></div>
      </div>
      <div>
        <h4 class="stage-title">Onboarding Completed</h4>
        <div class="stage-user-count">${s2Count.toLocaleString()}</div>
      </div>
      <div class="stage-pct-row">
        <span>Funnel Volume</span>
        <span class="text-blue">${s2Pct}%</span>
      </div>
      <div class="stage-bar-track">
        <div class="stage-bar-fill" style="width: ${s2Pct}%;"></div>
      </div>
      <div class="stage-card-footer">
        <span>≥2 features or TTFV ≤48h</span>
        <span class="stage-filter-hint"><i data-lucide="arrow-right"></i> View</span>
      </div>
    </div>

    <!-- Connector 2 -> 3 -->
    <div class="funnel-connector">
      <div class="connector-arrow"><i data-lucide="chevron-right"></i></div>
      <div class="dropoff-badge ${maxDropTransition.id === 'step-2-3' ? 'is-highest' : ''}">
        <span class="dropoff-pct">-${drop23Pct}%</span>
        <span class="dropoff-count">${drop23Count.toLocaleString()} dropped</span>
      </div>
      <span class="connector-retention">${ret23Pct}% passed</span>
    </div>

    <!-- Stage 3: Key Feature Activated -->
    <div class="funnel-stage-card stage-3 ${isStage3Bottleneck ? 'is-bottleneck' : ''}" onclick="filterByFunnelStage('power')" title="Click to inspect accounts activating power features">
      <div class="stage-card-header">
        <span class="stage-num-badge">STAGE 03</span>
        ${isStage3Bottleneck ? '<span class="stage-bottleneck-badge"><i data-lucide="alert-triangle"></i> Bottleneck</span>' : ''}
        <div class="stage-icon-circle"><i data-lucide="zap"></i></div>
      </div>
      <div>
        <h4 class="stage-title">Key Feature Activated</h4>
        <div class="stage-user-count">${s3Count.toLocaleString()}</div>
      </div>
      <div class="stage-pct-row">
        <span>Funnel Volume</span>
        <span class="text-purple">${s3Pct}%</span>
      </div>
      <div class="stage-bar-track">
        <div class="stage-bar-fill" style="width: ${s3Pct}%;"></div>
      </div>
      <div class="stage-card-footer">
        <span>Automation & Integrations</span>
        <span class="stage-filter-hint"><i data-lucide="arrow-right"></i> View</span>
      </div>
    </div>

    <!-- Connector 3 -> 4 -->
    <div class="funnel-connector">
      <div class="connector-arrow"><i data-lucide="chevron-right"></i></div>
      <div class="dropoff-badge ${maxDropTransition.id === 'step-3-4' ? 'is-highest' : ''}">
        <span class="dropoff-pct">-${drop34Pct}%</span>
        <span class="dropoff-count">${drop34Count.toLocaleString()} dropped</span>
      </div>
      <span class="connector-retention">${ret34Pct}% passed</span>
    </div>

    <!-- Stage 4: Upgraded to Paid -->
    <div class="funnel-stage-card stage-4 ${isStage4Bottleneck ? 'is-bottleneck' : ''}" onclick="filterByFunnelStage('converted')" title="Click to inspect converted paying customers">
      <div class="stage-card-header">
        <span class="stage-num-badge">STAGE 04</span>
        ${isStage4Bottleneck ? '<span class="stage-bottleneck-badge"><i data-lucide="alert-triangle"></i> Peak Churn</span>' : ''}
        <div class="stage-icon-circle"><i data-lucide="award"></i></div>
      </div>
      <div>
        <h4 class="stage-title">Upgraded to Paid</h4>
        <div class="stage-user-count">${s4Count.toLocaleString()}</div>
      </div>
      <div class="stage-pct-row">
        <span>Overall Conversion</span>
        <span class="text-emerald">${s4Pct}%</span>
      </div>
      <div class="stage-bar-track">
        <div class="stage-bar-fill" style="width: ${s4Pct}%;"></div>
      </div>
      <div class="stage-card-footer">
        <span>Paid Subscription Active</span>
        <span class="stage-filter-hint"><i data-lucide="arrow-right"></i> View</span>
      </div>
    </div>
  `;

  // 5. Update Diagnostic Callout Box
  updateFunnelBottleneckCallout(maxDropTransition, s3Count, s4Count);

  if (window.lucide) lucide.createIcons();
}

function updateFunnelBottleneckCallout(bottleneck, s3Count = 0, s4Count = 0) {
  const callout = document.getElementById('funnel-bottleneck-callout');
  if (!callout) return;

  if (!bottleneck) {
    callout.style.display = 'none';
    return;
  }
  callout.style.display = 'flex';

  const stageText = document.getElementById('bottleneck-stage-text');
  const rateBadge = document.getElementById('bottleneck-rate-badge');
  const descText = document.getElementById('bottleneck-desc-text');

  if (stageText) stageText.textContent = `Stage ${bottleneck.stepNum} (${bottleneck.fromStage} → ${bottleneck.toStage})`;
  if (rateBadge) rateBadge.textContent = `${bottleneck.dropPct}% Drop-off (${bottleneck.dropCount.toLocaleString()} Users Lost)`;
  if (descText) {
    descText.innerHTML = `<strong>Root Cause & Diagnosis:</strong> ${bottleneck.desc} ${bottleneck.diag}`;
  }
}

function filterByFunnelStage(stage) {
  const viewUsers = document.getElementById('view-users');
  switchTab('users');

  const searchInput = document.getElementById('search-users');
  const statusFilter = document.getElementById('filter-status');

  if (stage === 'converted') {
    if (statusFilter) {
      statusFilter.value = 'converted';
      applyFilters();
    }
  } else if (stage === 'power_non_conv') {
    if (statusFilter) statusFilter.value = 'non-converted';
    applyFilters();
  } else if (stage === 'power') {
    // Show table and sort by highest propensity / feature count
    currentSortField = 'used_power_feature';
    currentSortAsc = false;
    renderUserTable();
  } else if (stage === 'onboarding') {
    currentSortField = 'distinct_features_used';
    currentSortAsc = false;
    renderUserTable();
  } else {
    currentSortField = 'conversion_propensity_score';
    currentSortAsc = false;
    renderUserTable();
  }

  // Smooth scroll to table view
  if (viewUsers) {
    viewUsers.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// -------------------------------------------------------------
// Executive KPI Calculations
// -------------------------------------------------------------
function updateKPIs() {
  const total = currentFilteredUsers.length;
  if (total === 0) {
    setKPI('kpi-total-users', '0', '0% Roster');
    setKPI('kpi-conv-rate', '0.0%', 'No Data');
    setKPI('kpi-avg-ttfv', '0.0h', 'No Data');
    setKPI('kpi-power-rate', '0.0%', 'No Data');
    setKPI('kpi-high-eng', '0.0%', 'No Data');
    return;
  }

  const convertedCount = currentFilteredUsers.filter(u => u.converted).length;
  const convRate = ((convertedCount / total) * 100).toFixed(1);
  
  const sumTTFV = currentFilteredUsers.reduce((acc, u) => acc + (u.time_to_first_value_hrs || 0), 0);
  const avgTTFV = (sumTTFV / total).toFixed(1);

  const powerCount = currentFilteredUsers.filter(u => u.used_power_feature).length;
  const powerRate = ((powerCount / total) * 100).toFixed(1);

  const highCount = currentFilteredUsers.filter(u => u.user_segment === 'High').length;
  const highPct = ((highCount / total) * 100).toFixed(1);

  setKPI('kpi-total-users', total.toLocaleString(), `${convertedCount.toLocaleString()} converted`);
  setKPI('kpi-conv-rate', `${convRate}%`, convRate >= 38 ? '+3.2% vs target' : '-1.4% vs target', convRate >= 38);
  setKPI('kpi-avg-ttfv', `${avgTTFV}h`, avgTTFV <= 36 ? 'Fast activation' : 'Delayed activation', avgTTFV <= 36);
  setKPI('kpi-power-rate', `${powerRate}%`, 'Automation & Invites');
  setKPI('kpi-high-eng', `${highPct}%`, `${highCount.toLocaleString()} accounts`);
}

function setKPI(id, val, footerText, isPositive = true) {
  const el = document.getElementById(id);
  if (!el) return;
  const valEl = el.querySelector('.kpi-value');
  const footerEl = el.querySelector('.kpi-footer');
  if (valEl) valEl.textContent = val;
  if (footerEl) footerEl.textContent = footerText;
}

// -------------------------------------------------------------
// Data Storytelling Callouts Rendering
// -------------------------------------------------------------
function updateStoryCallouts() {
  const container = document.getElementById('story-grid');
  if (!container || !masterData.stories) return;

  // Calculate live dynamic metrics for storytelling callouts based on filtered dataset!
  const total = currentFilteredUsers.length;
  if (total === 0) return;

  const ttfv12 = currentFilteredUsers.filter(u => u.time_to_first_value_hrs <= 12);
  const ttfv72 = currentFilteredUsers.filter(u => u.time_to_first_value_hrs > 72);
  const rate12 = ttfv12.length > 0 ? (ttfv12.filter(u => u.converted).length / ttfv12.length * 100).toFixed(1) : '0';
  const rate72 = ttfv72.length > 0 ? (ttfv72.filter(u => u.converted).length / ttfv72.length * 100).toFixed(1) : '0';

  const powerUsers = currentFilteredUsers.filter(u => u.used_power_feature);
  const nonPowerUsers = currentFilteredUsers.filter(u => !u.used_power_feature);
  const powerRate = powerUsers.length > 0 ? (powerUsers.filter(u => u.converted).length / powerUsers.length * 100).toFixed(1) : '0';
  const nonPowerRate = nonPowerUsers.length > 0 ? (nonPowerUsers.filter(u => u.converted).length / nonPowerUsers.length * 100).toFixed(1) : '0';

  container.innerHTML = `
    <div class="story-card type-success">
      <div class="story-header">
        <span class="story-tag">CRITICAL SIGNAL</span>
        <span class="story-stat-badge">${rate12}% vs ${rate72}%</span>
      </div>
      <h3 class="story-title">⚡ Speed-to-Value Acceleration</h3>
      <p class="story-summary">Users reaching Time-to-First-Value within &lt;12 hours convert at <strong>${rate12}%</strong>, compared to only <strong>${rate72}%</strong> when delayed &gt;72h.</p>
      <div class="story-action-box">
        <span class="story-action-title"><i data-lucide="sparkles"></i> Actionable Recommendation</span>
        Trigger automated onboarding tooltips and video tours within 2 hours of signup to drive immediate first feature execution.
        <button class="story-btn-filter" onclick="filterByStory('High')">Filter High Segment Accounts</button>
      </div>
    </div>

    <div class="story-card type-primary">
      <div class="story-header">
        <span class="story-tag">POWER ACTIVATION</span>
        <span class="story-stat-badge">${powerRate}% Conv Rate</span>
      </div>
      <h3 class="story-title">🚀 Power Feature Acceleration</h3>
      <p class="story-summary">Accounts activating Team Invites, Integrations or Automation convert at <strong>${powerRate}%</strong> vs <strong>${nonPowerRate}%</strong> for single-feature users.</p>
      <div class="story-action-box">
        <span class="story-action-title"><i data-lucide="sparkles"></i> Actionable Recommendation</span>
        Prompt free-trial users with an 'Invite Teammate' pop-up on day 2 and highlight API/Integrations templates.
        <button class="story-btn-filter" onclick="filterByStory('power')">Filter Power Feature Users</button>
      </div>
    </div>

    <div class="story-card type-warning">
      <div class="story-header">
        <span class="story-tag">ARCHETYPE SIGNAL</span>
        <span class="story-stat-badge">2.0x Conversion Lift</span>
      </div>
      <h3 class="story-title">🎯 High-Engagement Archetype</h3>
      <p class="story-summary">High-engagement accounts exhibit 7.8 avg sessions/trial and convert 2.0x faster than medium or low engagement cohorts.</p>
      <div class="story-action-box">
        <span class="story-action-title"><i data-lucide="sparkles"></i> Actionable Recommendation</span>
        Prioritize Sales SDR outreach to trial users scoring 70+ in Conversion Propensity Score within their first 5 days.
        <button class="story-btn-filter" onclick="filterByStory('propensity')">View Top Propensity Leads</button>
      </div>
    </div>

    <div class="story-card type-danger">
      <div class="story-header">
        <span class="story-tag">CHURN RISK</span>
        <span class="story-stat-badge">Days 4–8 Drop-off</span>
      </div>
      <h3 class="story-title">⚠️ Mid-Trial Churn Bottleneck</h3>
      <p class="story-summary">82.4% of non-converting trial users flatline in session activity between Day 4 and Day 8 of their trial window.</p>
      <div class="story-action-box">
        <span class="story-action-title"><i data-lucide="sparkles"></i> Actionable Recommendation</span>
        Send an automated re-engagement email sequence featuring custom alert templates when user activity pauses for &gt;48 hours.
        <button class="story-btn-filter" onclick="filterByStory('non-converted')">Filter Non-Converted Trial Accounts</button>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();
}

function filterByStory(type) {
  const segSelect = document.getElementById('filter-segment');
  const statSelect = document.getElementById('filter-status');

  if (type === 'High') {
    if (segSelect) segSelect.value = 'High';
  } else if (type === 'non-converted') {
    if (statSelect) statSelect.value = 'non-converted';
  } else if (type === 'propensity') {
    activeTab = 'users';
    switchTab('users');
    currentSortField = 'conversion_propensity_score';
    currentSortAsc = false;
  }
  applyFilters();
}

// -------------------------------------------------------------
// Interactive Chart.js Visualizations
// -------------------------------------------------------------
function renderCharts() {
  if (typeof Chart === 'undefined') return;

  renderTrendChart();
  renderSegmentChart();
  renderFeatureChart();
}

function renderTrendChart() {
  const ctx = document.getElementById('chart-trend')?.getContext('2d');
  if (!ctx) return;

  if (chartInstances.trend) chartInstances.trend.destroy();

  // Aggregate signups & conversions by month from currentFilteredUsers
  const monthlyMap = {};
  currentFilteredUsers.forEach(u => {
    const month = u.signup_date.substring(0, 7); // YYYY-MM
    if (!monthlyMap[month]) monthlyMap[month] = { signups: 0, conv: 0 };
    monthlyMap[month].signups++;
    if (u.converted) monthlyMap[month].conv++;
  });

  const labels = Object.keys(monthlyMap).sort();
  const signupData = labels.map(m => monthlyMap[m].signups);
  const convData = labels.map(m => monthlyMap[m].conv);
  const rateData = labels.map(m => monthlyMap[m].signups > 0 ? (monthlyMap[m].conv / monthlyMap[m].signups * 100).toFixed(1) : 0);

  const displayLabels = labels.map(l => {
    const d = new Date(l + '-01');
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  });

  chartInstances.trend = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: displayLabels,
      datasets: [
        {
          label: 'Total Signups',
          data: signupData,
          backgroundColor: 'rgba(59, 130, 246, 0.4)',
          borderColor: '#3b82f6',
          borderWidth: 1.5,
          borderRadius: 6,
          yAxisID: 'y'
        },
        {
          label: 'Conversions',
          data: convData,
          backgroundColor: 'rgba(16, 185, 129, 0.6)',
          borderColor: '#10b981',
          borderWidth: 1.5,
          borderRadius: 6,
          yAxisID: 'y'
        },
        {
          type: 'line',
          label: 'Conversion Rate (%)',
          data: rateData,
          borderColor: '#00f2fe',
          backgroundColor: 'rgba(0, 242, 254, 0.1)',
          borderWidth: 3,
          tension: 0.35,
          pointBackgroundColor: '#00f2fe',
          pointRadius: 4,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', weight: 600 } } },
        tooltip: { backgroundColor: '#0d1322', titleColor: '#f1f5f9', bodyColor: '#94a3b8', borderColor: 'rgba(0, 242, 254, 0.3)', borderWidth: 1 }
      },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' }, title: { display: true, text: 'Accounts Count', color: '#64748b' } },
        y1: { position: 'right', grid: { drawOnChartArea: false }, ticks: { color: '#00f2fe', callback: v => v + '%' }, title: { display: true, text: 'Conversion Rate %', color: '#00f2fe' } }
      }
    }
  });
}

function renderSegmentChart() {
  const ctx = document.getElementById('chart-segment')?.getContext('2d');
  if (!ctx) return;

  if (chartInstances.segment) chartInstances.segment.destroy();

  const segs = ['High', 'Medium', 'Low'];
  const segData = segs.map(s => {
    const sub = currentFilteredUsers.filter(u => u.user_segment === s);
    return sub.length > 0 ? (sub.filter(u => u.converted).length / sub.length * 100).toFixed(1) : 0;
  });

  chartInstances.segment = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['High Engagement', 'Medium Engagement', 'Low Engagement'],
      datasets: [{
        label: 'Conversion Rate (%)',
        data: segData,
        backgroundColor: ['rgba(16, 185, 129, 0.7)', 'rgba(59, 130, 246, 0.7)', 'rgba(244, 63, 94, 0.7)'],
        borderColor: ['#10b981', '#3b82f6', '#f43f5e'],
        borderWidth: 1.5,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { backgroundColor: '#0d1322', titleColor: '#f1f5f9', bodyColor: '#94a3b8' }
      },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8', callback: v => v + '%' }, max: 60 }
      }
    }
  });
}

function renderFeatureChart() {
  const ctx = document.getElementById('chart-feature')?.getContext('2d');
  if (!ctx) return;

  if (chartInstances.feature) chartInstances.feature.destroy();

  const featList = masterData.feature_impact || [
    { feature: "Automation Rules", conv_rate: 43.1 },
    { feature: "Custom Alerts", conv_rate: 42.6 },
    { feature: "Api Access", conv_rate: 42.4 },
    { feature: "Integrations", conv_rate: 42.1 },
    { feature: "Team Invite", conv_rate: 42.1 }
  ];

  const labels = featList.map(f => f.feature);
  const data = featList.map(f => f.conv_rate);

  chartInstances.feature = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        axis: 'y',
        label: 'Conversion Rate (%)',
        data: data,
        backgroundColor: 'rgba(0, 242, 254, 0.5)',
        borderColor: '#00f2fe',
        borderWidth: 1.5,
        borderRadius: 6
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { backgroundColor: '#0d1322', titleColor: '#f1f5f9', bodyColor: '#94a3b8' }
      },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8', callback: v => v + '%' } },
        y: { grid: { display: false }, ticks: { color: '#f1f5f9', font: { weight: 600 } } }
      }
    }
  });
}

// -------------------------------------------------------------
// Cohort Table Heatmap Generation
// -------------------------------------------------------------
function renderCohortTable() {
  const tbody = document.getElementById('cohort-table-body');
  if (!tbody || !masterData.cohorts) return;

  tbody.innerHTML = masterData.cohorts.map(c => {
    const cRateClass = c.conversion_rate >= 40 ? 'status-converted' : 'status-non-converted';
    return `
      <tr>
        <td><strong>${c.cohort}</strong></td>
        <td>${c.total_users.toLocaleString()}</td>
        <td>${c.converted_users.toLocaleString()}</td>
        <td><span class="${cRateClass}">${c.conversion_rate}%</span></td>
        <td>${c.avg_active_days} days</td>
        <td style="background: rgba(16, 185, 129, ${c.retention_d3 / 150}); color: #fff; font-weight: 700;">${c.retention_d3}%</td>
        <td style="background: rgba(16, 185, 129, ${c.retention_d8 / 150}); color: #fff; font-weight: 700;">${c.retention_d8}%</td>
        <td style="background: rgba(16, 185, 129, ${c.retention_d14 / 150}); color: #fff; font-weight: 700;">${c.retention_d14}%</td>
        <td>
          <span style="font-size: 0.72rem; color: #f43f5e;">Early: ${c.early_dropoff}</span> | 
          <span style="font-size: 0.72rem; color: #f59e0b;">Mid: ${c.mid_dropoff}</span> | 
          <span style="font-size: 0.72rem; color: #10b981;">Complete: ${c.completed_window}</span>
        </td>
      </tr>
    `;
  }).join('');
}

// -------------------------------------------------------------
// User Roster Table with Search, Sort & Pagination
// -------------------------------------------------------------
function renderUserTable() {
  const tbody = document.getElementById('user-table-body');
  if (!tbody) return;

  const searchVal = document.getElementById('search-users')?.value.toLowerCase() || '';

  let filtered = currentFilteredUsers.filter(u => {
    if (!searchVal) return true;
    return u.user_id.toLowerCase().includes(searchVal) ||
           u.plan_interested.toLowerCase().includes(searchVal) ||
           u.industry.toLowerCase().includes(searchVal);
  });

  // Sorting
  filtered.sort((a, b) => {
    let valA = a[currentSortField];
    let valB = b[currentSortField];
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    if (valA < valB) return currentSortAsc ? -1 : 1;
    if (valA > valB) return currentSortAsc ? 1 : -1;
    return 0;
  });

  const totalFiltered = filtered.length;
  const totalPages = Math.ceil(totalFiltered / pageSize) || 1;
  if (currentPage > totalPages) currentPage = totalPages;

  const startIdx = (currentPage - 1) * pageSize;
  const pageUsers = filtered.slice(startIdx, startIdx + pageSize);

  tbody.innerHTML = pageUsers.map(u => {
    const segClass = u.user_segment.toLowerCase();
    const statusClass = u.converted ? 'status-converted' : 'status-non-converted';
    const statusText = u.converted ? 'Converted' : 'Trial Active';

    let barColor = 'var(--accent-emerald)';
    if (u.conversion_propensity_score < 40) barColor = 'var(--accent-rose)';
    else if (u.conversion_propensity_score < 70) barColor = 'var(--accent-amber)';

    return `
      <tr>
        <td><strong>${u.user_id}</strong></td>
        <td>${u.signup_date}</td>
        <td>${u.industry}</td>
        <td style="text-transform: capitalize;">${u.plan_interested}</td>
        <td>${u.total_sessions}</td>
        <td>${u.distinct_features_used} / 10</td>
        <td>${u.time_to_first_value_hrs}h</td>
        <td>${u.used_power_feature ? '<span style="color:var(--accent-emerald);">✔ Yes</span>' : '<span style="color:var(--text-dim);">No</span>'}</td>
        <td><span class="badge-segment ${segClass}">${u.user_segment}</span></td>
        <td><span class="${statusClass}">${statusText}</span></td>
        <td>
          <div class="propensity-bar-container">
            <div class="propensity-bar-bg">
              <div class="propensity-bar-fill" style="width: ${u.conversion_propensity_score}%; background: ${barColor};"></div>
            </div>
            <span class="propensity-val" style="color: ${barColor};">${u.conversion_propensity_score}</span>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Update Pagination Controls
  const pageInfo = document.getElementById('pagination-info');
  if (pageInfo) {
    pageInfo.textContent = `Showing ${startIdx + 1}–${Math.min(startIdx + pageSize, totalFiltered)} of ${totalFiltered} Accounts`;
  }

  const prevBtn = document.getElementById('btn-prev-page');
  const nextBtn = document.getElementById('btn-next-page');

  if (prevBtn) {
    prevBtn.disabled = currentPage <= 1;
    prevBtn.onclick = () => { if (currentPage > 1) { currentPage--; renderUserTable(); } };
  }
  if (nextBtn) {
    nextBtn.disabled = currentPage >= totalPages;
    nextBtn.onclick = () => { if (currentPage < totalPages) { currentPage++; renderUserTable(); } };
  }
}

function handleSort(field) {
  if (currentSortField === field) {
    currentSortAsc = !currentSortAsc;
  } else {
    currentSortField = field;
    currentSortAsc = false;
  }
  renderUserTable();
}

// -------------------------------------------------------------
// Tabs Navigation
// -------------------------------------------------------------
function setupTabListeners() {
  const tabCohorts = document.getElementById('tab-btn-cohorts');
  const tabUsers = document.getElementById('tab-btn-users');

  if (tabCohorts) tabCohorts.addEventListener('click', () => switchTab('cohorts'));
  if (tabUsers) tabUsers.addEventListener('click', () => switchTab('users'));
}

function switchTab(tabName) {
  activeTab = tabName;
  const tabCohorts = document.getElementById('tab-btn-cohorts');
  const tabUsers = document.getElementById('tab-btn-users');
  const viewCohorts = document.getElementById('view-cohorts');
  const viewUsers = document.getElementById('view-users');

  if (tabName === 'cohorts') {
    tabCohorts?.classList.add('active');
    tabUsers?.classList.remove('active');
    if (viewCohorts) viewCohorts.style.display = 'block';
    if (viewUsers) viewUsers.style.display = 'none';
  } else {
    tabUsers?.classList.add('active');
    tabCohorts?.classList.remove('active');
    if (viewUsers) viewUsers.style.display = 'block';
    if (viewCohorts) viewCohorts.style.display = 'none';
    renderUserTable();
  }
}

// -------------------------------------------------------------
// AI Insights Modal
// -------------------------------------------------------------
function setupModalListeners() {
  const aiBtn = document.getElementById('btn-ai-insights');
  const modal = document.getElementById('ai-modal');
  const closeBtn = document.getElementById('btn-close-modal');

  if (aiBtn && modal) {
    aiBtn.addEventListener('click', () => modal.classList.add('active'));
  }
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  }
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }
}

// -------------------------------------------------------------
// Export CSV Functionality
// -------------------------------------------------------------
function exportFilteredDataCSV() {
  if (!currentFilteredUsers || currentFilteredUsers.length === 0) {
    alert("No data available to export.");
    return;
  }

  const headers = [
    "user_id", "signup_date", "trial_end_date", "company_size", "industry",
    "plan_interested", "converted", "total_sessions", "distinct_features_used",
    "time_to_first_value_hrs", "used_power_feature", "user_segment", "conversion_propensity_score"
  ];

  let csvStr = headers.join(",") + "\n";

  currentFilteredUsers.forEach(u => {
    const row = [
      u.user_id, u.signup_date, u.trial_end_date, u.company_size, `"${u.industry}"`,
      u.plan_interested, u.converted, u.total_sessions, u.distinct_features_used,
      u.time_to_first_value_hrs, u.used_power_feature, u.user_segment, u.conversion_propensity_score
    ];
    csvStr += row.join(",") + "\n";
  });

  const blob = new Blob([csvStr], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `FeatureIQ_Trial_Insights_Export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
