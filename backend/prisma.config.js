require('dotenv').config();
const { defineConfig } = require('@prisma/config');

module.exports = defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || 'postgresql://USERNAME:PASSWORD@HOST:5432/DATABASE_NAME?schema=public',
  },
  migrations: {
    seed: 'node prisma/seed.js',
  },
});
