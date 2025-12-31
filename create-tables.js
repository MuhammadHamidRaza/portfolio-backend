const fs = require('fs');
const { sql } = require('./db');

async function createTables() {
  try {
    console.log('Reading SQL file...');
    const sqlContent = fs.readFileSync('./create-tables.sql', 'utf8');

    // Split by semicolons and execute each statement
    const statements = sqlContent.split(';').filter(s => s.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        await sql(statement);
      }
    }

    console.log('All tables created successfully!');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

createTables();
