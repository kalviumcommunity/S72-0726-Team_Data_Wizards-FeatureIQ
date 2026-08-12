const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const pool = require("./db");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// In-Memory Real Data Store (Loaded from Processed Datasets & Analysis CSVs)
const dataStore = {
  users: [],
  monthlyTrends: [],
  featureImpact: [],
  funnel: [],
  kpis: [],
  leads: [],
};

// CSV Loader Utility
function loadCSV(filePath) {
  return new Promise((resolve) => {
    if (!fs.existsSync(filePath)) {
      console.warn(`[Data Loader] Warning: File not found: ${filePath}`);
      return resolve([]);
    }
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (err) => {
        console.error(`[Data Loader] Error reading ${filePath}:`, err);
        resolve([]);
      });
  });
}

// Load all real data on server start
async function initializeRealData() {
  console.log("⚡ Loading real datasets from data/processed & analysis/...");
  
  const rootDir = path.join(__dirname, "..");
  
  const usersPath = path.join(rootDir, "data", "processed", "clean_trial_users_enriched.csv");
  const fallbackUsersPath = path.join(rootDir, "data", "processed", "clean_trial_users.csv");
  const trendsPath = path.join(rootDir, "analysis", "monthly_cohort_trends.csv");
  const impactPath = path.join(rootDir, "analysis", "v_feature_impact.csv");
  const funnelPath = path.join(rootDir, "analysis", "funnel_analysis.csv");
  const kpiPath = path.join(rootDir, "analysis", "kpi_summary.csv");
  const leadsPath = path.join(rootDir, "analysis", "user_propensity_ranked.csv");

  let rawUsers = await loadCSV(fs.existsSync(usersPath) ? usersPath : fallbackUsersPath);
  dataStore.users = rawUsers.map((u) => ({
    user_id: u.user_id,
    signup_date: u.signup_date ? u.signup_date.substring(0, 10) : "",
    trial_end_date: u.trial_end_date ? u.trial_end_date.substring(0, 10) : "",
    company_size: u.company_size || "1-10",
    industry: u.industry || mapCompanySize(u.company_size),
    plan_interested: u.plan_interested || "pro",
    converted: u.converted === "True" || u.converted === "true" || u.converted === "1" || u.converted === true,
    total_sessions: Number(u.total_sessions || 0),
    distinct_active_days: Number(u.distinct_active_days || 0),
    distinct_features_used: Number(u.distinct_features_used || 0),
    time_to_first_value_hrs: Number(u.time_to_first_value_hrs || 0),
    used_power_feature: u.used_power_feature === "True" || u.used_power_feature === "true" || u.used_power_feature === "1" || u.used_power_feature === true,
    engagement_slope: Number(u.engagement_slope || 0),
    drop_off_stage: u.drop_off_stage || "completed_trial_window",
    user_segment: u.user_segment || "Medium",
    conversion_propensity_score: Number(u.conversion_propensity_score || 50),
    archetype: u.archetype || "Casual User",
    is_anomaly: u.is_anomaly === "True" || u.is_anomaly === "true" || u.is_anomaly === "1",
  }));

  dataStore.monthlyTrends = await loadCSV(trendsPath);
  dataStore.featureImpact = await loadCSV(impactPath);
  dataStore.funnel = await loadCSV(funnelPath);
  dataStore.kpis = await loadCSV(kpiPath);
  dataStore.leads = await loadCSV(leadsPath);

  console.log(`✅ Real Dataset Loaded: ${dataStore.users.length} Users, ${dataStore.monthlyTrends.length} Monthly Cohorts, ${dataStore.featureImpact.length} Feature Impact rows.`);
}

function mapCompanySize(size) {
  if (size === "200+") return "Enterprise";
  if (size === "51-200") return "Mid-Market SaaS";
  if (size === "11-50") return "Growth / SMB";
  if (size === "1-10") return "Startup / Seed";
  return "Other / Unassigned";
}

// Initialize datasets
initializeRealData();

// ==========================================
// API ENDPOINTS (SERVING REAL DATA)
// ==========================================

app.get("/", (req, res) => {
  res.json({
    message: "FeatureIQ Real Data Backend is running!",
    userCount: dataStore.users.length,
    status: "Healthy",
  });
});

app.get("/api/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS connected");
    res.json({ message: "MySQL connected successfully!", result: rows });
  } catch (error) {
    // Return real dataset status if MySQL connection is unconfigured
    res.json({
      message: "Real Dataset Service active",
      source: "CSV / Processed Pipeline Data",
      userCount: dataStore.users.length,
    });
  }
});

// GET REAL USERS
app.get("/api/users", async (req, res) => {
  try {
    if (pool) {
      try {
        const [rows] = await pool.query("SELECT * FROM users");
        if (rows && rows.length > 0) return res.json(rows);
      } catch (e) {
        // Fallback to real loaded dataset
      }
    }
    res.json(dataStore.users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// GET ONE USER
app.get("/api/users/:id", (req, res) => {
  const user = dataStore.users.find((u) => u.user_id === req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

// GET MONTHLY TRENDS
app.get("/api/monthly-trends", (req, res) => {
  res.json(dataStore.monthlyTrends);
});

// GET FEATURE IMPACT
app.get("/api/feature-impact", (req, res) => {
  res.json(dataStore.featureImpact);
});

// GET FUNNEL ANALYSIS
app.get("/api/funnel", (req, res) => {
  res.json(dataStore.funnel);
});

// GET KPIS
app.get("/api/kpis", (req, res) => {
  res.json(dataStore.kpis);
});

// GET PRIORITY LEADS
app.get("/api/leads", (req, res) => {
  const sortedLeads = [...dataStore.users].sort((a, b) => b.conversion_propensity_score - a.conversion_propensity_score);
  res.json(sortedLeads.slice(0, 50));
});

// START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 FeatureIQ Real Data Backend running on http://localhost:${PORT}`);
});