const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const pool = require("./db");

const dataPath = path.join(__dirname, "..", "data", "processed");


// Read CSV file
function readCSV(fileName) {
    return new Promise((resolve, reject) => {
        const results = [];

        fs.createReadStream(path.join(dataPath, fileName))
            .pipe(csv())
            .on("data", (row) => results.push(row))
            .on("end", () => resolve(results))
            .on("error", reject);
    });
}


// Convert True/False into MySQL 1/0
function toBoolean(value) {
    if (value === undefined || value === null || value === "") {
        return null;
    }

    return value.toString().toLowerCase() === "true" ? 1 : 0;
}


// Convert empty strings to NULL
function nullIfEmpty(value) {
    return value === "" || value === undefined ? null : value;
}


async function seedDatabase() {
    const connection = await pool.getConnection();

    try {
        console.log("Connected to MySQL.");
        console.log("Reading CSV files...");

        // Read all three CSV files
        const users = await readCSV("clean_trial_users_enriched.csv");
        const activities = await readCSV("activity_clean.csv");
        const usages = await readCSV("usage_clean.csv");

        console.log(`Users found: ${users.length}`);
        console.log(`Activities found: ${activities.length}`);
        console.log(`Usage records found: ${usages.length}`);

        await connection.beginTransaction();

        /*
         * Delete existing data first.
         * This makes the script safe to run again.
         */

        await connection.query("DELETE FROM feature_usage");
        await connection.query("DELETE FROM activity");
        await connection.query("DELETE FROM users");

        console.log("Old data cleared.");


        // ==========================================
        // INSERT USERS
        // ==========================================

        const userSQL = `
            INSERT INTO users (
                user_id,
                signup_date,
                trial_end_date,
                company_size,
                plan_interested,
                converted,
                conversion_date,
                total_sessions,
                distinct_active_days,
                distinct_features_used,
                total_feature_events,
                time_to_first_value_hrs,
                feature_adoption_breadth,
                used_power_feature,
                session_frequency,
                engagement_slope,
                drop_off_stage,
                user_segment,
                industry,
                conversion_propensity_score,
                upgrade_status,
                events_per_session,
                active_day_ratio,
                features_per_active_day,
                is_fast_activator,
                has_positive_slope,
                converted_int,
                cohort_month,
                archetype
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;


        for (const user of users) {

            await connection.query(userSQL, [
                user.user_id,
                nullIfEmpty(user.signup_date),
                nullIfEmpty(user.trial_end_date),
                user.company_size,
                user.plan_interested,

                toBoolean(user.converted),

                nullIfEmpty(user.conversion_date),

                Number(user.total_sessions),
                Number(user.distinct_active_days),
                Number(user.distinct_features_used),
                Number(user.total_feature_events),

                Number(user.time_to_first_value_hrs),
                Number(user.feature_adoption_breadth),

                toBoolean(user.used_power_feature),

                Number(user.session_frequency),
                Number(user.engagement_slope),

                user.drop_off_stage,
                user.user_segment,
                user.industry,

                Number(user.conversion_propensity_score),

                user.upgrade_status,

                Number(user.events_per_session),
                Number(user.active_day_ratio),
                Number(user.features_per_active_day),

                Number(user.is_fast_activator),
                Number(user.has_positive_slope),
                Number(user.converted_int),

                user.cohort_month,
                user.archetype
            ]);
        }

        console.log("Users inserted successfully.");


        // ==========================================
        // INSERT ACTIVITY
        // ==========================================

        const activitySQL = `
            INSERT INTO activity (
                user_id,
                event_timestamp,
                event_type,
                device,
                event_date,
                event_hour
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `;


        for (const activity of activities) {

            await connection.query(activitySQL, [
                activity.user_id,
                nullIfEmpty(activity.event_timestamp),
                activity.event_type,
                activity.device,
                nullIfEmpty(activity.event_date),
                activity.event_hour === ""
                    ? null
                    : Number(activity.event_hour)
            ]);
        }

        console.log("Activity data inserted successfully.");


        // ==========================================
        // INSERT FEATURE USAGE
        // ==========================================

        const usageSQL = `
            INSERT INTO feature_usage (
                user_id,
                feature_name,
                usage_timestamp,
                usage_count
            )
            VALUES (?, ?, ?, ?)
        `;


        for (const usage of usages) {

            await connection.query(usageSQL, [
                usage.user_id,
                usage.feature_name,
                nullIfEmpty(usage.usage_timestamp),
                usage.usage_count === ""
                    ? null
                    : Number(usage.usage_count)
            ]);
        }

        console.log("Feature usage data inserted successfully.");


        await connection.commit();

        console.log("\n=================================");
        console.log("DATABASE SEEDING COMPLETE!");
        console.log("=================================");
        console.log(`Users: ${users.length}`);
        console.log(`Activity: ${activities.length}`);
        console.log(`Feature Usage: ${usages.length}`);
        console.log("=================================");

    } catch (error) {

        await connection.rollback();

        console.error("\nDatabase seeding failed:");
        console.error(error);

    } finally {

        connection.release();
        await pool.end();

    }
}


seedDatabase();