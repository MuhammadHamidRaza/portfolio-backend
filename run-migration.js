const { neon } = require("@neondatabase/serverless");
const fs = require("fs");
require("dotenv").config();

const sql = neon(process.env.DATABASE_URL);

async function runMigration() {
  try {
    console.log("🔄 Running migration: Add images column to contributions...");

    // Read SQL file
    const migrationSQL = fs.readFileSync("./add-images-to-contributions.sql", "utf-8");

    // Split by semicolons and execute each statement
    const statements = migrationSQL
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      await sql(statement);
    }

    console.log("✅ Migration completed successfully!");
    console.log("✅ Column 'images' added to contributions table");

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
