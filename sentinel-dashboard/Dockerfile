# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build the app
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# CLEANUP: Ensure no extensionless config files interfere with Prisma 7
RUN rm -f prisma.config

# Set build-time variables for Prisma 7 & Next.js 16
ENV DATABASE_URL="postgresql://localhost:5432/placeholder"
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=1

# Generate Prisma client
RUN npx prisma generate

# Build the Next.js app in standalone mode
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]