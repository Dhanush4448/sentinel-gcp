# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Build the app
FROM node:20-alpine AS builder
WORKDIR /app

# Install all dependencies (including dev) for build
COPY package.json package-lock.json ./
RUN npm ci

# Copy source files
COPY . .

# CLEANUP: Ensure no extensionless config files interfere with Prisma 7
RUN rm -f prisma.config

# Set build-time variables for Prisma 7 & Next.js 16
# Note: DATABASE_URL will be provided at runtime via Secret Manager
ENV DATABASE_URL="postgresql://localhost:5432/placeholder"
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=1
ENV NODE_ENV=production

# Generate Prisma client
RUN npx prisma generate

# Build the Next.js app in standalone mode
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Copy startup script
COPY --chown=nextjs:nodejs scripts/start.sh ./start.sh
RUN chmod +x ./start.sh

USER nextjs

EXPOSE 3000

# Use startup script that handles secret loading
CMD ["./start.sh"]
