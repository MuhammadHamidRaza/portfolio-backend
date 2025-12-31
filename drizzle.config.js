const { defineConfig } = require('drizzle-kit');

module.exports = defineConfig({
  schema: "./schema.js",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
