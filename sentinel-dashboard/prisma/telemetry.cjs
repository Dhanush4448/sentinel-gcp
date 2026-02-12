const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

// Prisma 7 standalone initialization with Driver Adapter
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const actions = ['LOGIN_ATTEMPT', 'FILE_ACCESS', 'API_CALL', 'PORT_SCAN_DETECTED', 'AUTH_FAILURE'];
const tiers = ['Free', 'Premium', 'Enterprise'];

async function generateLog() {
  const randomAction = actions[Math.floor(Math.random() * actions.length)];
  const randomTier = tiers[Math.floor(Math.random() * tiers.length)];
  
  try {
    await prisma.securityLog.create({
      data: {
        user_id: `user_${Math.floor(Math.random() * 1000)}`,
        action: randomAction,
        tier: randomTier,
      },
    });
    console.log(`[${new Date().toLocaleTimeString()}] Log Generated: ${randomAction}`);
  } catch (err) {
    console.error("Failed to generate log:", err);
  }
}

console.log('Telemetry Generator Started (Prisma 7 Adapter Mode)...');
setInterval(generateLog, 5000);
