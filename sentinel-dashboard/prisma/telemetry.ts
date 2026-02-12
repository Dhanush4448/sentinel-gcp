import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config()

// Prisma 7 often requires the connection string explicitly in standalone scripts
const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL
})

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

console.log('Telemetry Generator Started...');
setInterval(generateLog, 5000);
