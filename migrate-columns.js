// Migration script to add new columns to existing tables
require("dotenv").config();
const { sql } = require("./db");

const migrate = async () => {
  try {
    console.log("Starting migration...");

    // 1. Add columns to home table
    console.log("Updating home table...");
    await sql`ALTER TABLE home ADD COLUMN IF NOT EXISTS profile_image TEXT;`;
    console.log("✓ home table updated");

    // 2. Add columns to about table
    console.log("Updating about table...");
    await sql`ALTER TABLE about ADD COLUMN IF NOT EXISTS bio_text_2 TEXT;`;
    await sql`ALTER TABLE about ADD COLUMN IF NOT EXISTS background_image TEXT;`;
    console.log("✓ about table updated");

    // 3. Add columns to skills table
    console.log("Updating skills table...");
    await sql`ALTER TABLE skills ADD COLUMN IF NOT EXISTS icon_url TEXT;`;
    console.log("✓ skills table updated");

    // 4. Add columns to projects table
    console.log("Updating projects table...");
    await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS image TEXT;`;
    await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS images TEXT;`;
    console.log("✓ projects table updated");

    // 5. Add columns to contributions table
    console.log("Updating contributions table...");
    await sql`ALTER TABLE contributions ADD COLUMN IF NOT EXISTS image TEXT;`;
    console.log("✓ contributions table updated");

    // 6. Add columns to experience table
    console.log("Updating experience table...");
    await sql`ALTER TABLE experience ADD COLUMN IF NOT EXISTS company_logo TEXT;`;
    console.log("✓ experience table updated");

    // 7. Add columns to education table
    console.log("Updating education table...");
    await sql`ALTER TABLE education ADD COLUMN IF NOT EXISTS institution_logo TEXT;`;
    console.log("✓ education table updated");

    // 8. Add columns to certifications table
    console.log("Updating certifications table...");
    await sql`ALTER TABLE certifications ADD COLUMN IF NOT EXISTS certificate_image TEXT;`;
    await sql`ALTER TABLE certifications ADD COLUMN IF NOT EXISTS issued_date TEXT;`;
    console.log("✓ certifications table updated");

    console.log("\nMigration completed successfully!");
  } catch (error) {
    console.error("Migration error:", error);
  }
};

migrate();
