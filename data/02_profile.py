"""
02_profile.py
Modules 2.14-2.17: Dataset intake, CSV ingestion, quality profiling, data dictionary prep.
Prints null/dupe/type/value-range summary for each raw source before any cleaning.
"""
import pandas as pd

RAW = "/home/claude/data-foundation/data/raw"

def profile(name, df):
    print(f"\n{'='*60}\n{name}  shape={df.shape}\n{'='*60}")
    print("dtypes:\n", df.dtypes)
    print("\nnull counts:\n", df.isnull().sum())
    print("\nduplicate rows (full):", df.duplicated().sum())
    for col in df.select_dtypes(include="object").columns:
        uniq = df[col].dropna().unique()
        if len(uniq) <= 15:
            print(f"  '{col}' unique values: {sorted(map(str, uniq))}")

conversion_df = pd.read_csv(f"{RAW}/conversion_data.csv")
activity_df = pd.read_csv(f"{RAW}/activity_logs.csv")
usage_df = pd.read_csv(f"{RAW}/feature_usage_logs.csv")

profile("conversion_data.csv", conversion_df)
profile("activity_logs.csv", activity_df)
profile("feature_usage_logs.csv", usage_df)

print("\nusage_count outlier check (feature_usage_logs):")
print(usage_df["usage_count"].describe())
