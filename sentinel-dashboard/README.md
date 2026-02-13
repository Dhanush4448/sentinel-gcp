# Sentinel Dashboard

Enterprise-grade security monitoring dashboard built with Next.js 15, NextAuth v5, and PostgreSQL.

## 🏗️ Architecture

- **Framework**: Next.js 16 (App Router)
- **Authentication**: NextAuth v5 (Auth.js) with Google OAuth
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: GCP Cloud Run
- **Secrets**: GCP Secret Manager
- **Logging**: Structured JSON logging (GCP Cloud Logging compatible)
- **Security**: RBAC, Rate Limiting, Security Headers, Input Validation

## ✨ Features

### Security
- ✅ Google OAuth authentication
- ✅ Persistent database sessions
- ✅ Role-Based Access Control (RBAC)
- ✅ Rate limiting (Upstash Redis or in-memory)
- ✅ Security headers (CSP, HSTS, XSS protection)
- ✅ Input validation and sanitization
- ✅ CSRF protection
- ✅ Audit logging

### Performance
- ✅ Database connection pooling
- ✅ Response caching
- ✅ Code splitting and optimization
- ✅ Image optimization
- ✅ Bundle size optimization

### Observability
- ✅ Structured logging
- ✅ Health checks
- ✅ Metrics endpoint
- ✅ Request tracing (Request IDs)
- ✅ Performance monitoring

### Developer Experience
- ✅ TypeScript strict mode
- ✅ ESLint + Prettier
- ✅ CI/CD pipeline
- ✅ Comprehensive documentation
- ✅ Database migrations
- ✅ Development tools

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL (optional - JWT sessions work without DB)
- Google OAuth credentials

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Generate Prisma client
npm run db:generate

# Run database migrations (if using database)
npm run db:migrate

# Start development server
npm run dev
```

### Environment Variables

Required:
```env
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret
AUTH_SECRET=your_32_character_secret
AUTH_TRUST_HOST=true
AUTH_URL=http://localhost:3000
```

Optional:
```env
DATABASE_URL=postgresql://user:password@host:5432/database
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token
```

## 📚 Documentation

- **[INDUSTRY_SETUP.md](./INDUSTRY_SETUP.md)** - Complete setup guide
- **[GCP_DEPLOYMENT.md](./GCP_DEPLOYMENT.md)** - GCP deployment instructions
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - API reference
- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - Database configuration
- **[PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)** - Production checklist

## 🧪 Testing

```bash
# Lint code
npm run lint

# Type check
npx tsc --noEmit

# Build for production
npm run build
```

## 🚢 Deployment

### GCP Cloud Run

```bash
# Set project
export GCP_PROJECT_ID=your-project-id

# Deploy
./deploy.ps1
```

See [GCP_DEPLOYMENT.md](./GCP_DEPLOYMENT.md) for detailed instructions.

## 🔒 Security Features

- **Authentication**: NextAuth v5 with database sessions
- **Authorization**: RBAC with 4 role levels
- **Rate Limiting**: Configurable per-route limits
- **Security Headers**: CSP, HSTS, XSS protection
- **Input Validation**: Zod schemas for all inputs
- **Audit Logging**: All security events logged
- **Secret Management**: GCP Secret Manager integration

## 📊 Monitoring

- **Health Check**: `/api/health`
- **Metrics**: `/api/metrics` (admin only)
- **Logs**: Structured JSON logging
- **Tracing**: Request IDs for correlation

## 🛠️ Development

```bash
# Start dev server
npm run dev

# Database studio
npm run db:studio

# Run migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate
```

## 📦 Project Structure

```
sentinel-dashboard/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API routes
│   │   └── ...           # Pages
│   ├── lib/              # Utilities
│   │   ├── auth.ts       # NextAuth config
│   │   ├── prisma.ts     # Database client
│   │   ├── rbac.ts       # Role permissions
│   │   ├── logger.ts     # Structured logging
│   │   ├── security.ts   # Security headers
│   │   ├── validation.ts # Input validation
│   │   ├── rate-limit.ts # Rate limiting
│   │   ├── errors.ts     # Error handling
│   │   └── cache.ts      # Caching
│   └── middleware.ts     # Route protection
├── prisma/
│   └── schema.prisma     # Database schema
├── scripts/              # Deployment scripts
└── .github/
    └── workflows/        # CI/CD pipelines
```

## 🎯 Industry Standards

This project follows enterprise best practices:

- ✅ **Security**: OWASP Top 10 protection
- ✅ **Performance**: Optimized bundles, caching, CDN-ready
- ✅ **Scalability**: Stateless design, horizontal scaling
- ✅ **Observability**: Comprehensive logging and metrics
- ✅ **Reliability**: Error handling, health checks, graceful degradation
- ✅ **Maintainability**: TypeScript, linting, documentation
- ✅ **CI/CD**: Automated testing and deployment

## 📄 License

Private - All rights reserved

## 🤝 Contributing

This is a private project. For questions or issues, contact the maintainer.
