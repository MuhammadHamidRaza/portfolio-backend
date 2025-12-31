// Database Connection using Neon PostgreSQL
require("dotenv").config();
const { neon } = require("@neondatabase/serverless");

// Create connection
const sql = neon(process.env.DATABASE_URL);

module.exports = { sql };
