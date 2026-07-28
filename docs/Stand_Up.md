Here is a **complete 22-Day Standup Planner** formatted line-by-line so each team member (**Vansh**, **Pranathi**, and **Mallu**) knows **exactly what to say in front of the mentor** during every daily standup.

---

### How to read your standup pitch every day:

> **Format:** *"Yesterday I finished [X]. Today I am working on [Y]. I have no blockers / My blocker is [Z]."*

---

## 📅 WEEK 1: Data Foundation & Setup

### **Day 1**

* **Vansh:** "Today I am starting **Domain 1**. I will kick off the sprint, write the PRD, and wireframe the initial PM dashboard so the team has clarity on Day 1." *(Modules 2.1, 2.9, 2.10)*
* **Pranathi:** "Today I am setting up the local SQL environment and running practice queries on dummy data to get my setup ready." *(Modules 2.7, 2.37)*
* **Mallu:** "Today I am setting up my visualization environment and revising core data viz principles and Plotly charts." *(Modules 2.45–2.46)*

### **Day 2**

* **Vansh:** "Yesterday I drafted the PRD and wireframes. Today I am setting up the team GitHub repo structure, Python virtual environments, branch policies, and folder layouts (`/data-foundation`, `/analysis`, `/app`)." *(Modules 2.11–2.13)*
* **Pranathi:** "Yesterday I set up SQL. Today I will practice complex SQL aggregation and filtering on sample datasets." *(Module 2.37)*
* **Mallu:** "Yesterday I revised viz principles. Today I am designing sample KPI card layouts and chart structures using Plotly." *(Module 2.47)*

### **Day 3**

* **Vansh:** "Yesterday the repo setup was completed. Today I am ingesting the raw CSV and JSON files across trial activity, feature usage, and conversions to profile data quality." *(Modules 2.14–2.15)*
* **Pranathi:** "Yesterday I practiced SQL aggregations. Today I am reviewing sample behavioral metrics and prepping SQL schema scripts for our upcoming insights layer."
* **Mallu:** "Yesterday I designed KPI cards. Today I am setting up a basic Streamlit app shell with layout sidebars and dummy metrics." *(Module 2.51)*

### **Day 4**

* **Vansh:** "Yesterday I profiled raw files. Today I am writing the official Data Dictionary (`data_dictionary.md`), handling missing values, and enforcing strict data types." *(Modules 2.16–2.19)*
* **Pranathi:** "Yesterday I prepped SQL schema scripts. Today I am reviewing pandas distribution functions and vectorized operations to quickly analyze Vansh's dataset once ready."
* **Mallu:** "Yesterday I built the Streamlit app shell. Today I am experimenting with interactive filter widgets inside Streamlit using sample data."

### **Day 5**

* **Vansh:** "Yesterday I cleaned missing values and data types. Today I am running record deduplication, cleaning text fields, and normalizing activity tags." *(Modules 2.20–2.21)*
* **Pranathi:** "Yesterday I prepped vectorized operations. Today I am creating template scripts for user segmentation and funnel drop-off analysis."
* **Mallu:** "Yesterday I tested filter widgets. Today I am setting up Streamlit session state management for dynamic dashboard controls."

### **Day 6**

* **Vansh:** "Yesterday I deduplicated records. Today I am building time-based features, addressing timestamp outliers, and adding data validation rules." *(Modules 2.22–2.24)*
* **Pranathi:** "Yesterday I created segmentation templates. Today I am preparing window functions and CTE templates to analyze user activity journeys."
* **Mallu:** "Yesterday I configured session state. Today I am working on executive summary layout templates for the app."

### **Day 7**

* **Vansh:** "Yesterday I handled timestamps and validation. Today I am merging all 3 raw sources into a unified user-timeline table and engineering key features like time-to-first-value and engagement slope." *(Modules 2.25–2.26)*
* **Pranathi:** "Yesterday I finished CTE templates. Today I am reviewing Vansh’s feature structure so I can start analysis smoothly tomorrow."
* **Mallu:** "Yesterday I drafted executive layouts. Today I am reviewing Plotly-to-Streamlit chart integrations."

---

## 📅 WEEK 2: Domain 1 Handoff & Analysis Layer (Pranathi Takes Over)

### **Day 8**

* **Vansh:** "Yesterday I completed feature engineering. Today I am executing the official **Domain 1 Handoff**: delivering `clean_trial_users.csv` and `data_dictionary.md` to the shared repo." *(Domain 1 Complete)*
* **Pranathi:** "Yesterday Vansh uploaded the cleaned data. Today I am starting **Domain 2** by executing vectorized computations, distribution checks, and correlation analysis on the cleaned dataset." *(Modules 2.27–2.29)*
* **Mallu:** "Yesterday I reviewed chart integrations. Today I am building dummy state alerts and threshold indicators for the dashboard."

### **Day 9**

* **Vansh:** "Domain 1 is complete and handed off. Today I am supporting data line-of-sight checks and documenting our data pipeline architecture."
* **Pranathi:** "Yesterday I performed distribution and correlation analysis. Today I am running GroupBy segment comparisons between converters vs. non-converters and calculating time-series rolling trends." *(Modules 2.30–2.31)*
* **Mallu:** "Yesterday I built alert indicators. Today I am refining CSS styling and layout responsiveness in Streamlit."

### **Day 10**

* **Vansh:** "Today I am checking data integrity constraints across edge cases identified in Pranathi's analysis."
* **Pranathi:** "Yesterday I completed converter vs non-converter comparisons. Today I am performing behavioral segmentation to create user archetypes and analyzing our funnel drop-off stages." *(Modules 2.32–2.33)*
* **Mallu:** "Yesterday I refined layout styling. Today I am working on report layout templates for PDF/image export functions."

### **Day 11**

* **Vansh:** "Today I am refining unit tests for our data ingestion script."
* **Pranathi:** "Yesterday I created user archetypes and funnel stages. Today I am defining core trial KPIs, conducting root-cause investigations on drop-offs, and running anomaly detection." *(Modules 2.34–2.36)*
* **Mallu:** "Yesterday I set up export templates. Today I am setting up the file upload and preview interface in Streamlit." *(Module 2.52)*

### **Day 12**

* **Vansh:** "Today I am assisting with pipeline optimization and verifying column mapping."
* **Pranathi:** "Yesterday I identified trial KPIs and drop-off root causes. Today I am writing foundational SQL queries, metrics aggregations, and window functions on PostgreSQL/DuckDB." *(Modules 2.38–2.41)*
* **Mallu:** "Yesterday I built the upload interface. Today I am connecting interactive input filters with sample Plotly charts." *(Module 2.53)*

### **Day 13**

* **Vansh:** "Today I am updating project PRD documentation based on intermediate insight findings."
* **Pranathi:** "Yesterday I wrote core SQL queries. Today I am optimizing query performance and building reusable SQL views: `v_conversion_kpis` and `v_user_segments`." *(Modules 2.42–2.43)*
* **Mallu:** "Yesterday I connected input filters. Today I am building multi-tab navigation layout inside the Streamlit app."

### **Day 14**

* **Vansh:** "Today I am running automated schema checks on our SQL database tables."
* **Pranathi:** "Yesterday I built the SQL views. Today I am cross-validating my SQL results against Python analysis and building user conversion-propensity scoring models." *(Module 2.44)*
* **Mallu:** "Yesterday I completed multi-tab navigation. Today I am reviewing Pranathi's metric outputs to prepare for tomorrow's handoff."

---

## 📅 WEEK 3: Domain 2 Handoff & Streamlit Product Delivery (Mallu Takes Over)

### **Day 15**

* **Vansh:** "Monitoring dataset stability."
* **Pranathi:** "Yesterday I completed cross-validation and propensity scoring. Today I am executing the official **Domain 2 Handoff**: delivering written behavioral insights, SQL views, and user propensity scores to the repo." *(Domain 2 Complete)*
* **Mallu:** "Yesterday Pranathi uploaded the insights. Today I am starting **Domain 3** by drafting the executive summary section and translating analytical findings into clear data stories." *(Modules 2.48–2.50)*

### **Day 16**

* **Vansh:** "Assisting with repository structure cleanup."
* **Pranathi:** "Domain 2 is complete. Today I am writing documentation for the SQL view definitions and query logic."
* **Mallu:** "Yesterday I wrote the data storytelling section. Today I am linking the real cleaned data and SQL views (`v_conversion_kpis`) directly into our Streamlit app state." *(Modules 2.52–2.53)*

### **Day 17**

* **Vansh:** "Reviewing data dictionary accuracy against live SQL views."
* **Pranathi:** "Today I am performing stress tests on SQL query response times for live app usage."
* **Mallu:** "Yesterday I linked the data to Streamlit. Today I am engineering real-time KPI dashboard cards and configuring custom alert threshold triggers." *(Modules 2.54–2.56)*

### **Day 18**

* **Vansh:** "Documenting ETL pipeline steps for the final report."
* **Pranathi:** "Documenting key SQL queries for the final presentation appendix."
* **Mallu:** "Yesterday I built KPI cards and alerts. Today I am implementing email/report sharing features and automated daily summary triggers." *(Module 2.57)*

### **Day 19**

* **Vansh:** "Creating workflow diagrams for data transformation stages."
* **Pranathi:** "Creating insight summary slides for the mentor presentation."
* **Mallu:** "Yesterday I built report sharing. Today I am building the automated daily pipeline runner script to update app metrics automatically." *(Module 2.58)*

### **Day 20**

* **Vansh:** "Verifying repository branch merge requests."
* **Pranathi:** "Reviewing dashboard output accuracy against SQL calculations."
* **Mallu:** "Yesterday I set up the pipeline script. Today I am setting up GitHub Actions CI workflows to validate app builds and tests." *(Module 2.59)*

---

## 📅 WEEK 4: Integration, Testing & Final Demo Prep

### **Day 21**

* **Vansh:** "Yesterday we locked code changes. Today I am writing the Data Foundation section of our final project documentation." *(Module 2.60)*
* **Pranathi:** "Yesterday I verified dashboard metrics. Today I am writing the SQL & Insights layer documentation." *(Module 2.60)*
* **Mallu:** "Yesterday I configured GitHub Actions CI. Today I am finalizing app documentation, usage instructions, and polishing overall UI styling." *(Module 2.60)*

### **Day 22 (Final Demo Day)**

* **Vansh:** "Today I will present Domain 1: how we cleaned, transformed 6 months of raw trial logs, and built unified user-timeline features."
* **Pranathi:** "Today I will present Domain 2: how our SQL views and behavioral analysis proved which user actions directly drive conversions."
* **Mallu:** "Today I will present Domain 3: demonstrating our live Streamlit App, real-time conversion KPIs, and how PMs can make data-driven decisions." *(Final Demo)*