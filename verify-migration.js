const { neon } = require("@neondatabase/serverless");
require("dotenv").config();

const sql = neon(process.env.DATABASE_URL);

async function verifyMigration() {
  try {
    console.log("🔍 Checking contributions table structure...\n");

    // Get table columns
    const columns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'contributions'
      ORDER BY ordinal_position
    `;

    console.log("Columns in contributions table:");
    columns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });

    // Check if images column exists
    const hasImages = columns.some(col => col.column_name === 'images');

    if (hasImages) {
      console.log("\n✅ 'images' column EXISTS in database");
    } else {
      console.log("\n❌ 'images' column DOES NOT EXIST - migration failed!");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

verifyMigration();
