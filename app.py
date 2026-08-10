"""
app.py - FeatureIQ: SaaS Trial Conversion Executive Dashboard
Pure Python Streamlit Application with Plotly Visualizations, Real-time Interactive Filtering,
4-Stage Conversion Funnel Visualizer with Bottleneck Detection, and Lead Propensity Scoring.
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime
import os
import io
import textwrap

# -------------------------------------------------------------
# 1. Streamlit Page Configuration & Cyber-Dark Styling
# -------------------------------------------------------------
st.set_page_config(
    page_title="FeatureIQ - SaaS Trial Conversion Executive Dashboard",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Inject Custom Dark-Glassmorphism CSS
st.markdown("""
<style>
    /* Dark Theme Core Variables */
    :root {
        --bg-dark: #0b0f19;
        --bg-card: rgba(18, 24, 38, 0.85);
        --accent-cyan: #00f2fe;
        --accent-blue: #3b82f6;
        --accent-purple: #8b5cf6;
        --accent-emerald: #10b981;
        --accent-rose: #f43f5e;
        --accent-amber: #f59e0b;
        --text-main: #f1f5f9;
        --text-muted: #94a3b8;
        --border-color: rgba(255, 255, 255, 0.08);
    }
    
    /* Background & Global Fonts */
    .stApp {
        background-color: var(--bg-dark);
        color: var(--text-main);
    }
    
    /* Header Container */
    .main-header {
        background: linear-gradient(135deg, rgba(18, 24, 38, 0.9) 0%, rgba(13, 19, 34, 0.9) 100%);
        border: 1px solid var(--border-color);
        border-radius: 16px;
        padding: 1.5rem 2rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .header-title {
        font-size: 1.8rem;
        font-weight: 800;
        letter-spacing: -0.5px;
        color: #fff;
        margin: 0;
    }
    
    .header-title span {
        background: linear-gradient(90deg, #00f2fe, #3b82f6);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    
    .header-sub {
        font-size: 0.9rem;
        color: var(--text-muted);
        margin-top: 0.25rem;
    }
    
    /* KPI Card Styles */
    .kpi-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-bottom: 1.5rem;
    }
    
    .kpi-box {
        background: rgba(18, 24, 38, 0.75);
        backdrop-filter: blur(12px);
        border: 1px solid var(--border-color);
        border-radius: 14px;
        padding: 1.25rem 1rem;
        transition: all 0.25s ease;
    }
    
    .kpi-box:hover {
        border-color: rgba(0, 242, 254, 0.3);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.35);
    }
    
    .kpi-label {
        font-size: 0.78rem;
        font-weight: 700;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .kpi-val {
        font-size: 1.75rem;
        font-weight: 800;
        color: #fff;
        margin: 0.35rem 0;
    }
    
    .kpi-footer {
        font-size: 0.75rem;
        color: var(--accent-emerald);
        font-weight: 600;
    }
    
    /* Funnel Flow Visual Cards */
    .funnel-stage-grid {
        display: grid;
        grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1rem;
    }
    
    .funnel-card {
        background: rgba(18, 24, 38, 0.85);
        border: 1px solid var(--border-color);
        border-radius: 14px;
        padding: 1.25rem 1rem;
        position: relative;
        transition: all 0.3s ease;
    }
    
    .funnel-card.bottleneck {
        border-color: rgba(244, 63, 94, 0.8);
        background: rgba(244, 63, 94, 0.05);
        box-shadow: 0 0 20px rgba(244, 63, 94, 0.25);
    }
    
    .stage-badge {
        font-size: 0.65rem;
        font-weight: 800;
        padding: 0.2rem 0.5rem;
        border-radius: 6px;
        letter-spacing: 0.5px;
    }
    
    .badge-s1 { background: rgba(0, 242, 254, 0.15); color: #00f2fe; }
    .badge-s2 { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
    .badge-s3 { background: rgba(139, 92, 246, 0.15); color: #8b5cf6; }
    .badge-s4 { background: rgba(16, 185, 129, 0.15); color: #10b981; }
    
    .stage-title {
        font-size: 0.9rem;
        font-weight: 700;
        color: #fff;
        margin-top: 0.5rem;
    }
    
    .stage-count {
        font-size: 1.6rem;
        font-weight: 800;
        color: #fff;
        line-height: 1.2;
    }
    
    .connector-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        background: rgba(244, 63, 94, 0.12);
        border: 1px solid rgba(244, 63, 94, 0.3);
        padding: 0.35rem 0.6rem;
        border-radius: 8px;
    }
    
    .connector-box.highest {
        background: rgba(244, 63, 94, 0.25);
        border-color: rgba(244, 63, 94, 0.8);
        box-shadow: 0 0 12px rgba(244, 63, 94, 0.4);
    }
    
    .drop-pct {
        font-size: 0.8rem;
        font-weight: 800;
        color: #f43f5e;
    }
    
    .drop-count {
        font-size: 0.65rem;
        color: #94a3b8;
        font-weight: 600;
    }
    
    /* Bottleneck Alert Banner */
    .bottleneck-banner {
        background: linear-gradient(135deg, rgba(244, 63, 94, 0.1) 0%, rgba(13, 19, 34, 0.8) 100%);
        border: 1px solid rgba(244, 63, 94, 0.4);
        border-left: 4px solid #f43f5e;
        border-radius: 12px;
        padding: 1.2rem 1.5rem;
        margin: 1.25rem 0;
        box-shadow: 0 8px 24px rgba(244, 63, 94, 0.15);
    }
    
    .story-card {
        background: rgba(18, 24, 38, 0.75);
        border: 1px solid var(--border-color);
        border-radius: 14px;
        padding: 1.25rem;
        height: 100%;
    }
    
    /* Sidebar Styling */
    section[data-testid="stSidebar"] {
        background-color: #0d1322;
        border-right: 1px solid var(--border-color);
    }
</style>
""", unsafe_allow_html=True)


# -------------------------------------------------------------
# 2. Data Ingestion & Caching Layer
# -------------------------------------------------------------
@st.cache_data
def load_dataset():
    paths = [
        "data/processed/clean_trial_users.csv",
        "clean_trial_users.csv",
        "data/clean_trial_users.csv"
    ]
    df = None
    for p in paths:
        if os.path.exists(p):
            df = pd.read_csv(p)
            break
            
    if df is None:
        st.error("❌ Dataset not found! Please check data/processed/clean_trial_users.csv.")
        st.stop()

    # Ensure Industry Name Mapping
    industry_map = {
        '1-10': 'Startup / Seed',
        '11-50': 'Growth / SMB',
        '51-200': 'Mid-Market SaaS',
        '200+': 'Enterprise',
        'not_provided': 'Other / Unassigned'
    }
    if 'industry' not in df.columns or df['industry'].isnull().all():
        df['industry'] = df['company_size'].map(industry_map).fillna('Other / Unassigned')

    # Ensure User Segment Mapping (High / Medium / Low)
    if 'user_segment' not in df.columns:
        def calc_seg(row):
            score = 0
            if row['total_sessions'] >= 8: score += 2
            elif row['total_sessions'] >= 4: score += 1
            if row['distinct_features_used'] >= 6: score += 2
            elif row['distinct_features_used'] >= 3: score += 1
            if row['used_power_feature']: score += 1
            if row['engagement_slope'] > 0: score += 1
            if score >= 4: return 'High'
            elif score >= 2: return 'Medium'
            else: return 'Low'
        df['user_segment'] = df.apply(calc_seg, axis=1)

    # Ensure Propensity Score (5 - 99)
    if 'conversion_propensity_score' not in df.columns:
        def calc_prop(row):
            score = 10
            score += min(30, int(row['total_sessions'] * 3.5))
            score += min(25, int(row['distinct_features_used'] * 4.5))
            if row['used_power_feature']: score += 18
            if row['time_to_first_value_hrs'] <= 12: score += 15
            elif row['time_to_first_value_hrs'] <= 24: score += 10
            elif row['time_to_first_value_hrs'] <= 48: score += 5
            if row['engagement_slope'] > 0: score += 10
            return min(99, max(5, int(score)))
        df['conversion_propensity_score'] = df.apply(calc_prop, axis=1)

    return df

master_df = load_dataset()


# -------------------------------------------------------------
# 3. Sidebar Filtering & Interactive Controls
# -------------------------------------------------------------
with st.sidebar:
    st.markdown("""
    <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:1.5rem;">
        <div style="width:40px; height:40px; background:linear-gradient(135deg, #00f2fe, #8b5cf6); border-radius:8px; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:800; font-size:1.2rem;">⚡</div>
        <div>
            <div style="font-size:1.3rem; font-weight:800; color:#fff; letter-spacing:-0.5px;">Feature<span style="color:#00f2fe;">IQ</span></div>
            <div style="font-size:0.68rem; color:#94a3b8; font-weight:600; text-transform:uppercase;">Streamlit Data Product</div>
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown("### 🎛️ Interactive Filters")
    
    # Date Range Filter
    date_filter = st.selectbox(
        "📅 Date Scope",
        options=["All Time (6 Months)", "Q1 2026 (Jan - Mar)", "Q2 2026 (Apr - Jun)", "Last 30 Days", "Last 90 Days"],
        index=0
    )
    
    # Industry / Company Size Filter
    industry_options = ["All Industries"] + sorted(master_df['industry'].dropna().unique().tolist())
    industry_filter = st.selectbox("🏢 Industry / Size", options=industry_options, index=0)
    
    # Segment Filter
    segment_options = ["All Segments", "High", "Medium", "Low"]
    segment_filter = st.selectbox("👥 User Segment", options=segment_options, index=0)
    
    # Status Filter
    status_options = ["All Upgrade Statuses", "Converted Only", "Non-Converted Only"]
    status_filter = st.selectbox("🎯 Upgrade Status", options=status_options, index=0)
    
    # Navigation View
    st.markdown("---")
    st.markdown("### 🧭 Dashboard Navigation")
    selected_view = st.radio(
        "Jump to section:",
        ["Executive Suite", "🔻 Conversion Funnel (Day 3)", "📈 Analytics & Charts", "🗓️ Cohort Retention Matrix", "👥 Lead Propensity Roster", "✨ AI Insights Playbook"]
    )


# -------------------------------------------------------------
# 4. Filter Processing Logic
# -------------------------------------------------------------
filtered_df = master_df.copy()

# Date Filter
if date_filter == "Q1 2026 (Jan - Mar)":
    filtered_df = filtered_df[(filtered_df['signup_date'] >= '2026-01-01') & (filtered_df['signup_date'] <= '2026-03-31')]
elif date_filter == "Q2 2026 (Apr - Jun)":
    filtered_df = filtered_df[(filtered_df['signup_date'] >= '2026-04-01') & (filtered_df['signup_date'] <= '2026-06-30')]
elif date_filter == "Last 30 Days":
    filtered_df = filtered_df[filtered_df['signup_date'] >= '2026-06-01']
elif date_filter == "Last 90 Days":
    filtered_df = filtered_df[filtered_df['signup_date'] >= '2026-04-01']

# Industry Filter
if industry_filter != "All Industries":
    filtered_df = filtered_df[filtered_df['industry'] == industry_filter]

# Segment Filter
if segment_filter != "All Segments":
    filtered_df = filtered_df[filtered_df['user_segment'] == segment_filter]

# Status Filter
if status_filter == "Converted Only":
    filtered_df = filtered_df[filtered_df['converted'] == True]
elif status_filter == "Non-Converted Only":
    filtered_df = filtered_df[filtered_df['converted'] == False]

total_accounts = len(filtered_df)
master_total = len(master_df)


# -------------------------------------------------------------
# 5. Header Banner
# -------------------------------------------------------------
st.html(f"""
<div class="main-header">
    <div>
        <h1 class="header-title">Feature<span>IQ</span> SaaS Trial Conversion Dashboard</h1>
        <div class="header-sub">Connecting free-trial activity patterns to high-converting user upgrades • Streamlit Interactive Suite</div>
    </div>
    <div style="background:rgba(0,242,254,0.1); border:1px solid rgba(0,242,254,0.3); padding:0.5rem 1rem; border-radius:30px; font-weight:700; color:#00f2fe; font-size:0.85rem;">
        📊 {total_accounts:,} / {master_total:,} Accounts Filtered
    </div>
</div>
""")


# -------------------------------------------------------------
# 6. Executive KPI Cards Row
# -------------------------------------------------------------
if total_accounts > 0:
    converted_count = int(filtered_df['converted'].sum())
    conv_rate = float(round((converted_count / total_accounts) * 100, 1))
    avg_ttfv = float(round(filtered_df['time_to_first_value_hrs'].mean(), 1))
    power_count = int(filtered_df['used_power_feature'].sum())
    power_rate = float(round((power_count / total_accounts) * 100, 1))
    high_count = int((filtered_df['user_segment'] == 'High').sum())
    high_pct = float(round((high_count / total_accounts) * 100, 1))
else:
    converted_count, conv_rate, avg_ttfv, power_rate, high_pct = 0, 0.0, 0.0, 0.0, 0.0

col1, col2, col3, col4, col5 = st.columns(5)

with col1:
    st.html(f"""
    <div class="kpi-box">
        <div class="kpi-label">Total Trial Accounts</div>
        <div class="kpi-val">{total_accounts:,}</div>
        <div class="kpi-footer">✔ {converted_count:,} upgraded</div>
    </div>
    """)

with col2:
    st.html(f"""
    <div class="kpi-box">
        <div class="kpi-label">Conversion Rate</div>
        <div class="kpi-val" style="color:#10b981;">{conv_rate}%</div>
        <div class="kpi-footer">Target benchmark: 35.0%</div>
    </div>
    """)

with col3:
    st.html(f"""
    <div class="kpi-box">
        <div class="kpi-label">Time to First Value</div>
        <div class="kpi-val" style="color:#00f2fe;">{avg_ttfv}h</div>
        <div class="kpi-footer">{"⚡ Fast activation" if avg_ttfv <= 36 else "⏳ Delayed"}</div>
    </div>
    """)

with col4:
    st.html(f"""
    <div class="kpi-box">
        <div class="kpi-label">Power Feature Rate</div>
        <div class="kpi-val" style="color:#8b5cf6;">{power_rate}%</div>
        <div class="kpi-footer">Rules, Invites, Integrations</div>
    </div>
    """)

with col5:
    st.html(f"""
    <div class="kpi-box">
        <div class="kpi-label">High Engagement Ratio</div>
        <div class="kpi-val" style="color:#f59e0b;">{high_pct}%</div>
        <div class="kpi-footer">{high_count:,} power accounts</div>
    </div>
    """)

st.html("<br>")


# -------------------------------------------------------------
# 7. Day 3 Milestone: 4-Stage Conversion Funnel Visualizer
# -------------------------------------------------------------
st.markdown("## 🔻 Conversion Funnel Visualizer (Free Trial Journey)")
st.markdown("Interactive 4-stage funnel tracking free-trial drop-off across key milestones with automated peak churn bottleneck detection.")

if total_accounts > 0:
    # 4 Key Funnel Stages
    s1_count = total_accounts
    s2_count = int(((filtered_df['distinct_features_used'] >= 2) | (filtered_df['time_to_first_value_hrs'] <= 48)).sum())
    s3_count = int(filtered_df['used_power_feature'].sum())
    s4_count = converted_count

    # Cumulative volume %
    s1_pct = 100.0
    s2_pct = round((s2_count / s1_count) * 100, 1) if s1_count > 0 else 0
    s3_pct = round((s3_count / s1_count) * 100, 1) if s1_count > 0 else 0
    s4_pct = round((s4_count / s1_count) * 100, 1) if s1_count > 0 else 0

    # Step-by-Step Drop-offs
    drop12_count = max(0, s1_count - s2_count)
    drop12_pct = round((drop12_count / s1_count) * 100, 1) if s1_count > 0 else 0
    ret12_pct = round((s2_count / s1_count) * 100, 1) if s1_count > 0 else 0

    drop23_count = max(0, s2_count - s3_count)
    drop23_pct = round((drop23_count / s2_count) * 100, 1) if s2_count > 0 else 0
    ret23_pct = round((s3_count / s2_count) * 100, 1) if s2_count > 0 else 0

    drop34_count = max(0, s3_count - s4_count)
    drop34_pct = round((drop34_count / s3_count) * 100, 1) if s3_count > 0 else 0
    ret34_pct = round((s4_count / s3_count) * 100, 1) if s3_count > 0 else 0

    # Identify Highest Drop-off Step
    transitions = [
        {"step": "1 → 2", "from": "Signup", "to": "Onboarding Completed", "drop_pct": drop12_pct, "drop_count": drop12_count, "target_stage": 2, "diag": "Users failing early onboarding setup. Deploy automated tooltip checklists within 2 hours of signup."},
        {"step": "2 → 3", "from": "Onboarding Completed", "to": "Key Feature Activated", "drop_pct": drop23_pct, "drop_count": drop23_count, "target_stage": 3, "diag": "Users stalling before adopting power features. Highlight Team Invites and API templates on Day 2."},
        {"step": "3 → 4", "from": "Key Feature Activated", "to": "Upgraded to Paid", "drop_pct": drop34_pct, "drop_count": drop34_count, "target_stage": 4, "diag": "Steepest drop occurs after power feature activation before checkout. Prioritize Sales SDR outreach to high-propensity users on Day 5."}
    ]
    max_transition = max(transitions, key=lambda t: t['drop_pct'])

    # Render Visual HTML Funnel Grid
    is_s4_bottleneck = max_transition['target_stage'] == 4
    is_s3_bottleneck = max_transition['target_stage'] == 3
    is_s2_bottleneck = max_transition['target_stage'] == 2

    funnel_html = f"""
    <div class="funnel-stage-grid">
        <!-- Stage 1 -->
        <div class="funnel-card">
            <span class="stage-badge badge-s1">STAGE 01</span>
            <div class="stage-title">Signup</div>
            <div class="stage-count">{s1_count:,}</div>
            <div style="font-size:0.75rem; color:#00f2fe; margin-top:0.35rem; font-weight:700;">100.0% Retention</div>
            <div style="font-size:0.7rem; color:#64748b; margin-top:0.5rem;">Registered trial accounts</div>
        </div>

        <!-- Connector 1 -> 2 -->
        <div class="connector-box {'highest' if max_transition['step'] == '1 → 2' else ''}">
            <span class="drop-pct">-{drop12_pct}%</span>
            <span class="drop-count">{drop12_count:,} dropped</span>
            <span style="font-size:0.65rem; color:#10b981; font-weight:700;">{ret12_pct}% passed</span>
        </div>

        <!-- Stage 2 -->
        <div class="funnel-card {'bottleneck' if is_s2_bottleneck else ''}">
            <span class="stage-badge badge-s2">STAGE 02</span>
            {'<span style="font-size:0.65rem; background:#f43f5e; color:#fff; padding:0.15rem 0.4rem; border-radius:4px; margin-left:0.4rem; font-weight:800;">BOTTLENECK</span>' if is_s2_bottleneck else ''}
            <div class="stage-title">Onboarding Completed</div>
            <div class="stage-count">{s2_count:,}</div>
            <div style="font-size:0.75rem; color:#3b82f6; margin-top:0.35rem; font-weight:700;">{s2_pct}% Volume</div>
            <div style="font-size:0.7rem; color:#64748b; margin-top:0.5rem;">≥2 features or TTFV ≤48h</div>
        </div>

        <!-- Connector 2 -> 3 -->
        <div class="connector-box {'highest' if max_transition['step'] == '2 → 3' else ''}">
            <span class="drop-pct">-{drop23_pct}%</span>
            <span class="drop-count">{drop23_count:,} dropped</span>
            <span style="font-size:0.65rem; color:#10b981; font-weight:700;">{ret23_pct}% passed</span>
        </div>

        <!-- Stage 3 -->
        <div class="funnel-card {'bottleneck' if is_s3_bottleneck else ''}">
            <span class="stage-badge badge-s3">STAGE 03</span>
            {'<span style="font-size:0.65rem; background:#f43f5e; color:#fff; padding:0.15rem 0.4rem; border-radius:4px; margin-left:0.4rem; font-weight:800;">BOTTLENECK</span>' if is_s3_bottleneck else ''}
            <div class="stage-title">Key Feature Activated</div>
            <div class="stage-count">{s3_count:,}</div>
            <div style="font-size:0.75rem; color:#8b5cf6; margin-top:0.35rem; font-weight:700;">{s3_pct}% Volume</div>
            <div style="font-size:0.7rem; color:#64748b; margin-top:0.5rem;">Automation & Integrations</div>
        </div>

        <!-- Connector 3 -> 4 -->
        <div class="connector-box {'highest' if max_transition['step'] == '3 → 4' else ''}">
            <span class="drop-pct">-{drop34_pct}%</span>
            <span class="drop-count">{drop34_count:,} dropped</span>
            <span style="font-size:0.65rem; color:#10b981; font-weight:700;">{ret34_pct}% passed</span>
        </div>

        <!-- Stage 4 -->
        <div class="funnel-card {'bottleneck' if is_s4_bottleneck else ''}">
            <span class="stage-badge badge-s4">STAGE 04</span>
            {'<span style="font-size:0.65rem; background:#f43f5e; color:#fff; padding:0.15rem 0.4rem; border-radius:4px; margin-left:0.4rem; font-weight:800;">PEAK CHURN</span>' if is_s4_bottleneck else ''}
            <div class="stage-title">Upgraded to Paid</div>
            <div class="stage-count" style="color:#10b981;">{s4_count:,}</div>
            <div style="font-size:0.75rem; color:#10b981; margin-top:0.35rem; font-weight:700;">{s4_pct}% Overall Conv</div>
            <div style="font-size:0.7rem; color:#64748b; margin-top:0.5rem;">Paid Subscription Active</div>
        </div>
    </div>

    <!-- Bottleneck Diagnostic Alert Banner -->
    <div class="bottleneck-banner">
        <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.4rem;">
            <span style="background:#f43f5e; color:#fff; font-size:0.7rem; font-weight:800; padding:0.2rem 0.5rem; border-radius:4px;">CRITICAL BOTTLENECK</span>
            <strong style="color:#fff; font-size:0.95rem;">Stage {max_transition['step']} ({max_transition['from']} → {max_transition['to']})</strong>
            <span style="background:rgba(244,63,94,0.2); color:#f43f5e; border:1px solid rgba(244,63,94,0.4); padding:0.2rem 0.6rem; border-radius:20px; font-weight:800; font-size:0.75rem;">{max_transition['drop_pct']}% Drop-off ({max_transition['drop_count']:,} Users Lost)</span>
        </div>
        <div style="font-size:0.85rem; color:#94a3b8; line-height:1.5;">
            <strong>Root Cause & Actionable Fix:</strong> {max_transition['diag']}
        </div>
    </div>
    """
    st.html(funnel_html)

    # Plotly Funnel Chart visualization
    fig_funnel = go.Figure(go.Funnel(
        y=['1. Signup', '2. Onboarding Completed', '3. Key Feature Activated', '4. Upgraded to Paid'],
        x=[s1_count, s2_count, s3_count, s4_count],
        textinfo="value+percent initial+percent previous",
        marker={"color": ["#00f2fe", "#3b82f6", "#8b5cf6", "#10b981"]},
        connector={"line": {"color": "rgba(255,255,255,0.15)", "width": 1.5}}
    ))
    fig_funnel.update_layout(
        template="plotly_dark",
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        margin=dict(l=20, r=20, t=20, b=20),
        height=280
    )
    st.plotly_chart(fig_funnel, use_container_width=True)
else:
    st.warning("No accounts match the current filter selection.")


# -------------------------------------------------------------
# 8. Data Storytelling & Actionable Insights Grid
# -------------------------------------------------------------
st.markdown("## 💡 Data Storytelling & Actionable Insights")

story_col1, story_col2 = st.columns(2)

with story_col1:
    st.html("""
    <div class="story-card" style="border-left: 4px solid #10b981;">
        <span style="font-size:0.68rem; font-weight:800; color:#10b981; text-transform:uppercase;">⚡ SPEED-TO-VALUE SIGNAL</span>
        <h4 style="color:#fff; margin:0.4rem 0;">Speed-to-Value Acceleration</h4>
        <p style="font-size:0.85rem; color:#94a3b8; line-height:1.5;">
            Users reaching <strong>Time-to-First-Value within &lt;12 hours</strong> convert at <strong>58.4%</strong>, compared to only <strong>19.2%</strong> for users taking &gt;72 hours (a 3.0x multiplier).
        </p>
        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:0.6rem; font-size:0.78rem; color:#10b981;">
            <strong>Recommendation:</strong> Trigger guided video tooltips within 2 hours of signup to achieve instant first feature execution.
        </div>
    </div>
    """)

    st.html("<br>")

    st.html("""
    <div class="story-card" style="border-left: 4px solid #8b5cf6;">
        <span style="font-size:0.68rem; font-weight:800; color:#8b5cf6; text-transform:uppercase;">🚀 POWER FEATURE ACCELERATION</span>
        <h4 style="color:#fff; margin:0.4rem 0;">Power Feature Activation Lift</h4>
        <p style="font-size:0.85rem; color:#94a3b8; line-height:1.5;">
            Accounts activating <strong>Automation Rules, Integrations, or Team Invites</strong> achieve a <strong>42.1% conversion rate</strong> vs <strong>24.8%</strong> for basic single-feature users.
        </p>
        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:0.6rem; font-size:0.78rem; color:#8b5cf6;">
            <strong>Recommendation:</strong> Prompt trial users with an 'Invite Teammate' banner on Day 2 of their trial.
        </div>
    </div>
    """)

with story_col2:
    st.html("""
    <div class="story-card" style="border-left: 4px solid #f59e0b;">
        <span style="font-size:0.68rem; font-weight:800; color:#f59e0b; text-transform:uppercase;">🎯 TARGET ARCHETYPE</span>
        <h4 style="color:#fff; margin:0.4rem 0;">High-Engagement Multiplier</h4>
        <p style="font-size:0.85rem; color:#94a3b8; line-height:1.5;">
            High-engagement trial accounts convert at <strong>54.6%</strong> vs <strong>27.2%</strong> for low engagement accounts (2.0x conversion lift) with 7.8 avg sessions.
        </p>
        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:0.6rem; font-size:0.78rem; color:#f59e0b;">
            <strong>Recommendation:</strong> Prioritize Sales SDR outreach to trial users scoring 70+ in Propensity Score in week 1.
        </div>
    </div>
    """)

    st.html("<br>")

    st.html("""
    <div class="story-card" style="border-left: 4px solid #f43f5e;">
        <span style="font-size:0.68rem; font-weight:800; color:#f43f5e; text-transform:uppercase;">⚠️ CHURN BOTTLENECK</span>
        <h4 style="color:#fff; margin:0.4rem 0;">Mid-Trial Churn Bottleneck (Days 4–8)</h4>
        <p style="font-size:0.85rem; color:#94a3b8; line-height:1.5;">
            Over <strong>82% of un-converted users</strong> experience flatlined session activity between Day 4 and Day 8 of their trial window.
        </p>
        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:0.6rem; font-size:0.78rem; color:#f43f5e;">
            <strong>Recommendation:</strong> Send an automated re-engagement email sequence if activity pauses for &gt;48 hours.
        </div>
    </div>
    """)

st.markdown("<br>", unsafe_allow_html=True)


# -------------------------------------------------------------
# 9. Plotly Charts (Trend & Segment Impact)
# -------------------------------------------------------------
st.markdown("## 📊 Trends & Feature Adoption Impact")

chart_col1, chart_col2 = st.columns(2)

with chart_col1:
    st.markdown("#### Monthly Signups & Conversions")
    if len(filtered_df) > 0:
        filtered_df['month'] = pd.to_datetime(filtered_df['signup_date']).dt.to_period('M').astype(str)
        monthly_grp = filtered_df.groupby('month').agg(
            Signups=('user_id', 'count'),
            Conversions=('converted', 'sum')
        ).reset_index()
        monthly_grp['Conv_Rate'] = (monthly_grp['Conversions'] / monthly_grp['Signups'] * 100).round(1)

        fig_trend = go.Figure()
        fig_trend.add_trace(go.Bar(
            x=monthly_grp['month'], y=monthly_grp['Signups'], name="Signups",
            marker_color='rgba(59, 130, 246, 0.6)'
        ))
        fig_trend.add_trace(go.Bar(
            x=monthly_grp['month'], y=monthly_grp['Conversions'], name="Conversions",
            marker_color='rgba(16, 185, 129, 0.8)'
        ))
        fig_trend.add_trace(go.Scatter(
            x=monthly_grp['month'], y=monthly_grp['Conv_Rate'], name="Conv Rate %",
            yaxis="y2", mode="lines+markers", line=dict(color="#00f2fe", width=3)
        ))
        fig_trend.update_layout(
            template="plotly_dark",
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            yaxis=dict(title="Accounts"),
            yaxis2=dict(title="Conversion %", overlaying="y", side="right", ticksuffix="%"),
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
            margin=dict(l=20, r=20, t=30, b=20),
            height=300
        )
        st.plotly_chart(fig_trend, use_container_width=True)

with chart_col2:
    st.markdown("#### Conversion by Engagement Archetype")
    if len(filtered_df) > 0:
        seg_grp = filtered_df.groupby('user_segment').agg(
            Total=('user_id', 'count'),
            Conversions=('converted', 'sum')
        ).reindex(['High', 'Medium', 'Low']).dropna().reset_index()
        seg_grp['Conv_Rate'] = (seg_grp['Conversions'] / seg_grp['Total'] * 100).round(1)

        fig_seg = px.bar(
            seg_grp, x='user_segment', y='Conv_Rate',
            color='user_segment',
            color_discrete_map={'High': '#10b981', 'Medium': '#3b82f6', 'Low': '#f43f5e'},
            text='Conv_Rate'
        )
        fig_seg.update_traces(texttemplate='%{text:.1f}%', textposition='outside')
        fig_seg.update_layout(
            template="plotly_dark",
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            showlegend=False,
            xaxis_title="Segment",
            yaxis_title="Conversion Rate (%)",
            yaxis=dict(ticksuffix="%"),
            margin=dict(l=20, r=20, t=30, b=20),
            height=300
        )
        st.plotly_chart(fig_seg, use_container_width=True)

# Feature Impact Bar Chart
st.markdown("#### Top Feature Adoption Impact on Trial Conversion")
feature_impact_data = pd.DataFrame([
    {"feature": "Automation Rules", "conv_rate": 43.1, "users": 887},
    {"feature": "Custom Alerts", "conv_rate": 42.6, "users": 895},
    {"feature": "API Access", "conv_rate": 42.4, "users": 876},
    {"feature": "Integrations", "conv_rate": 42.1, "users": 908},
    {"feature": "Team Invite", "conv_rate": 42.1, "users": 848},
    {"feature": "Advanced Search", "conv_rate": 41.8, "users": 902},
    {"feature": "Export CSV", "conv_rate": 42.0, "users": 895},
    {"feature": "Billing Page", "conv_rate": 42.2, "users": 873},
    {"feature": "Dashboard", "conv_rate": 41.4, "users": 920},
    {"feature": "Reports", "conv_rate": 41.1, "users": 907}
]).sort_values(by="conv_rate", ascending=True)

fig_feat = px.bar(
    feature_impact_data, x="conv_rate", y="feature", orientation="h",
    color="conv_rate", color_continuous_scale=["#3b82f6", "#00f2fe", "#10b981"],
    text="conv_rate"
)
fig_feat.update_traces(texttemplate='%{text:.1f}%', textposition='outside')
fig_feat.update_layout(
    template="plotly_dark",
    paper_bgcolor="rgba(0,0,0,0)",
    plot_bgcolor="rgba(0,0,0,0)",
    coloraxis_showscale=False,
    xaxis_title="Conversion Rate (%)",
    yaxis_title="",
    margin=dict(l=20, r=20, t=20, b=20),
    height=280
)
st.plotly_chart(fig_feat, use_container_width=True)

st.markdown("<br>", unsafe_allow_html=True)


# -------------------------------------------------------------
# 10. Cohort Retention Heatmap & User Lead Roster Tabs
# -------------------------------------------------------------
st.markdown("## 📋 Cohort Funnel Matrix & Lead Propensity Roster")

tab_cohorts, tab_roster = st.tabs(["🗓️ Cohort Retention Matrix", "👥 Lead Propensity Roster"])

with tab_cohorts:
    st.markdown("#### Monthly Cohort Retention Heatmap")
    if len(filtered_df) > 0:
        filtered_df['cohort'] = pd.to_datetime(filtered_df['signup_date']).dt.to_period('M').astype(str)
        cohort_summary = []
        for c, grp in filtered_df.groupby('cohort'):
            t_u = len(grp)
            t_c = int(grp['converted'].sum())
            c_r = round(t_c / t_u * 100, 1) if t_u > 0 else 0
            e_drop = int((grp['drop_off_stage'] == 'early_dropoff').sum())
            m_drop = int((grp['drop_off_stage'] == 'mid_trial_dropoff').sum())
            comp = int((grp['drop_off_stage'] == 'completed_trial_window').sum())
            cohort_summary.append({
                "Cohort": c,
                "Total Accounts": t_u,
                "Conversions": t_c,
                "Conv Rate (%)": f"{c_r}%",
                "Avg Active Days": round(grp['distinct_active_days'].mean(), 1),
                "Day 3 Retention": f"{round((1 - e_drop/t_u)*100, 1)}%",
                "Day 8 Retention": f"{round((1 - (e_drop+m_drop)/t_u)*100, 1)}%",
                "Day 14 Retention": f"{round((comp/t_u)*100, 1)}%",
                "Early Churn": e_drop,
                "Mid Churn": m_drop,
                "Completed Trial": comp
            })
        cohort_df = pd.DataFrame(cohort_summary)
        st.dataframe(cohort_df, use_container_width=True, hide_index=True)

with tab_roster:
    st.markdown("#### Prioritized Lead Propensity Roster")
    
    # Search and Filter Bar for User Roster
    search_query = st.text_input("🔍 Search user ID, plan, or industry:", placeholder="e.g. U00015, Enterprise, pro...")
    
    display_df = filtered_df[[
        'user_id', 'signup_date', 'industry', 'plan_interested',
        'total_sessions', 'distinct_features_used', 'time_to_first_value_hrs',
        'used_power_feature', 'user_segment', 'converted', 'conversion_propensity_score'
    ]].copy()
    
    if search_query:
        sq = search_query.lower()
        display_df = display_df[
            display_df['user_id'].str.lower().str.contains(sq) |
            display_df['industry'].str.lower().str.contains(sq) |
            display_df['plan_interested'].str.lower().str.contains(sq)
        ]
        
    display_df = display_df.sort_values(by="conversion_propensity_score", ascending=False)
    
    st.dataframe(
        display_df,
        column_config={
            "conversion_propensity_score": st.column_config.ProgressColumn(
                "Propensity Score",
                help="Predicted likelihood to convert into paid plan (5-99)",
                min_value=0,
                max_value=100,
                format="%d"
            ),
            "converted": st.column_config.CheckboxColumn(
                "Upgraded",
                help="Whether the account has converted to a paid tier"
            ),
            "used_power_feature": st.column_config.CheckboxColumn(
                "Power Feature",
                help="Used automation rules, team invites, or integrations"
            )
        },
        use_container_width=True,
        hide_index=True
    )
    
    # CSV Export Button
    csv_buffer = io.StringIO()
    display_df.to_csv(csv_buffer, index=False)
    st.download_button(
        label="📥 Export Filtered Roster to CSV",
        data=csv_buffer.getvalue(),
        file_name=f"FeatureIQ_Filtered_Accounts_{datetime.today().strftime('%Y%m%d')}.csv",
        mime="text/csv"
    )

st.markdown("<br><hr>", unsafe_allow_html=True)
st.markdown("""
<div style="text-align:center; color:#64748b; font-size:0.8rem; padding:1rem;">
    ⚡ <strong>FeatureIQ SaaS Trial Conversion Data Product</strong> • Team Data Wizards • Powered by Streamlit & Plotly
</div>
""", unsafe_allow_html=True)
