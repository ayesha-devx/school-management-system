const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;

// Instantiate the driver adapter with connectionString
const adapter = new PrismaPg({ connectionString });

// Instantiate the Prisma Client with the driver adapter
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
