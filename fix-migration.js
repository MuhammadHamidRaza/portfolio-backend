const { neon } = require("@neondatabase/serverless");
require("dotenv").config();

const sql = neon(process.env.DATABASE_URL);

async function fixMigration() {
  try {
    console.log("🔄 Adding images column to contributions table...\n");

    // Direct ALTER TABLE command
    await sql`ALTER TABLE contributions ADD COLUMN IF NOT EXISTS images TEXT`;

    console.log("✅ Column added successfully!\n");

    // Verify
    const columns = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'contributions'
      ORDER BY ordinal_position
    `;

    console.log("Updated columns:");
    columns.forEach(col => console.log(`  - ${col.column_name}`));

    const hasImages = columns.some(col => col.column_name === 'images');

    if (hasImages) {
      console.log("\n✅ SUCCESS! 'images' column now exists!");
    } else {
      console.log("\n❌ FAILED! Column still missing");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

fixMigration();
