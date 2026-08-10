# FeatureIQ — SaaS Trial Conversion Data Product
**Team Data Wizards (Kalvium Module 2 Deliverable)**

Connecting free-trial activity patterns to high-converting user upgrades with real-time interactive analytics, conversion funnel visualization, and lead propensity scoring.

---

## 🚀 Running the Dashboards

### 1. Modern Next.js App Router Dashboard (5 Pages)

Built with **Next.js (App Router), TypeScript, Tailwind CSS, Recharts, and Lucide Icons**:

```bash
# Navigate to the dashboard directory
cd dashboard

# Install dependencies (if needed)
npm install

# Start the Next.js development server
npm run dev
```
Open **`http://localhost:3000`** in your browser.

**Pages Included**:
- 📊 **Overview** (`http://localhost:3000/`): Executive KPIs, Behavioral Discovery banner, Monthly Signups & Conversions area chart.
- 🔻 **Funnel Analysis** (`http://localhost:3000/funnel`): 4-stage funnel flow, drop-off connectors, peak churn bottleneck highlight, 7D/30D historical trend chart, top friction points, and AI insights.
- ⚡ **Feature Adoption** (`http://localhost:3000/adoption`): Feature adoption comparison (Converted vs Non-Converted), usage depth metric averages, and Drive Team Invites opportunity card.
- 👥 **Lead Propensity Roster** (`http://localhost:3000/leads`): High-propensity lead queue with search, feature badges, score meters, engagement slope chart, and 1-click **Export CSV**.
- ⚙️ **Settings** (`http://localhost:3000/settings`): Profile management, workspace controls, analytics config, email digest & anomaly alert toggles, and logout.

---

### 2. Pure Python Streamlit Dashboard

```bash
# Launch Streamlit app
streamlit run app.py
```
Open **`http://localhost:8501`** in your browser.
