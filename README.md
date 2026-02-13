# 🛡️ Sentinel GCP - Enterprise Security Platform

A comprehensive, enterprise-grade security monitoring and authentication platform built with modern technologies, designed for production deployment on Google Cloud Platform.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)](https://www.postgresql.org/)
[![GCP](https://img.shields.io/badge/GCP-Cloud%20Run-orange)](https://cloud.google.com/run)

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Components](#components)
- [Features](#features)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Deployment](#deployment)
- [Security](#security)
- [Contributing](#contributing)

## 🎯 Overview

Sentinel GCP is a full-stack security platform consisting of:

1. **Sentinel Dashboard** - Next.js-based web application with enterprise authentication and monitoring
2. **Backend Services** - Python/FastAPI microservices for core functionality
3. **API Gateway** - Centralized API routing and management

This platform demonstrates industry-level development practices including security, scalability, observability, and production-ready deployment configurations.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client Browser                       │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Sentinel Dashboard (Next.js)              │
│  • Authentication (NextAuth v5)                        │
│  • Professional UI/UX                                  │
│  • API Documentation                                   │
│  • Real-time Monitoring                                │
└──────────────┬───────────────────────────┬──────────────┘
               │                           │
               ▼                           ▼
    ┌──────────────────┐      ┌──────────────────────┐
    │  API Gateway     │      │  Backend Services    │
    │  (FastAPI)       │      │  (Python/FastAPI)    │
    └──────────────────┘      └──────────────────────┘
               │                           │
               └───────────┬───────────────┘
                           ▼
              ┌──────────────────────┐
              │  PostgreSQL Database │
              │  (Cloud SQL)         │
              └──────────────────────┘
```

## 📦 Components

### 1. Sentinel Dashboard (`sentinel-dashboard/`)

**Technology Stack:**
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, NextAuth v5
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: GCP Cloud Run with Docker

**Key Features:**
- 🔐 Google OAuth 2.0 authentication
- 👥 Role-Based Access Control (RBAC)
- 📊 Real-time system monitoring
- 🔒 Enterprise security features
- 📚 Comprehensive API documentation
- 🎨 Professional, responsive UI

**See [sentinel-dashboard/README.md](./sentinel-dashboard/README.md) for detailed documentation.**

### 2. Backend Services (`services/`)

**Technology Stack:**
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL with SQLAlchemy
- **Deployment**: GCP Cloud Run / Kubernetes

**Components:**
- API Gateway for centralized routing
- Microservices architecture
- Database migrations with Alembic

### 3. Infrastructure

- **Containerization**: Docker & Docker Compose
- **Orchestration**: Kubernetes (via YAML configs)
- **CI/CD**: GitHub Actions
- **Secrets**: GCP Secret Manager
- **Monitoring**: GCP Cloud Logging

## ✨ Features

### Security
- ✅ OAuth 2.0 authentication (Google)
- ✅ Persistent database sessions
- ✅ Role-Based Access Control (4 roles: USER, ADMIN, MODERATOR, VIEWER)
- ✅ Rate limiting (Upstash Redis or in-memory)
- ✅ Security headers (CSP, HSTS, XSS protection)
- ✅ Input validation and sanitization
- ✅ CSRF protection
- ✅ Comprehensive audit logging

### Performance
- ✅ Database connection pooling
- ✅ Response caching
- ✅ Code splitting and optimization
- ✅ Image optimization
- ✅ Horizontal scaling ready

### Observability
- ✅ Structured JSON logging (GCP Cloud Logging compatible)
- ✅ Health check endpoints
- ✅ Metrics endpoint (admin only)
- ✅ Request tracing (Request IDs)
- ✅ Performance monitoring

### Developer Experience
- ✅ TypeScript strict mode
- ✅ ESLint + Prettier
- ✅ CI/CD pipeline (GitHub Actions)
- ✅ Comprehensive documentation
- ✅ Database migrations
- ✅ Development tools

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ (for Dashboard)
- **Python** 3.12+ (for Backend Services)
- **PostgreSQL** 15+ (or Docker for local)
- **Docker** (optional, for local database)
- **Google OAuth** credentials

### Dashboard Setup

```bash
# Navigate to dashboard
cd sentinel-dashboard

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Start database (if using Docker)
docker-compose up -d db

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the dashboard.

### Backend Services Setup

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start services
# (See individual service READMEs for specific commands)
```

## 📚 Documentation

### Dashboard Documentation

- **[README.md](./sentinel-dashboard/README.md)** - Dashboard overview
- **[ARCHITECTURE.md](./sentinel-dashboard/ARCHITECTURE.md)** - System architecture
- **[API_DOCUMENTATION.md](./sentinel-dashboard/API_DOCUMENTATION.md)** - API reference
- **[GCP_DEPLOYMENT.md](./sentinel-dashboard/GCP_DEPLOYMENT.md)** - Deployment guide
- **[DEMO_GUIDE.md](./sentinel-dashboard/DEMO_GUIDE.md)** - Demo walkthrough
- **[PROJECT_EXPLANATION.md](./sentinel-dashboard/PROJECT_EXPLANATION.md)** - Project overview

### Setup Guides

- **[QUICK_START.md](./sentinel-dashboard/QUICK_START.md)** - Quick setup
- **[DATABASE_SETUP.md](./sentinel-dashboard/DATABASE_SETUP.md)** - Database configuration
- **[AUTH_SETUP.md](./sentinel-dashboard/AUTH_SETUP.md)** - Authentication setup
- **[PRODUCTION_SETUP.md](./sentinel-dashboard/PRODUCTION_SETUP.md)** - Production checklist

### Enterprise Features

- **[ENTERPRISE_FEATURES.md](./sentinel-dashboard/ENTERPRISE_FEATURES.md)** - Feature list
- **[ENTERPRISE_CHECKLIST.md](./sentinel-dashboard/ENTERPRISE_CHECKLIST.md)** - Readiness checklist
- **[SECURITY_AUDIT.md](./sentinel-dashboard/SECURITY_AUDIT.md)** - Security audit

## 🚢 Deployment

### GCP Cloud Run (Recommended)

```bash
# Set GCP project
export GCP_PROJECT_ID=your-project-id

# Deploy dashboard
cd sentinel-dashboard
./deploy.ps1  # Windows
# or
./deploy.sh   # Linux/Mac
```

### Docker Compose (Local)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### Kubernetes

See `deployment.yaml` and `service.yaml` for Kubernetes configurations.

## 🔒 Security

### Environment Variables

**Never commit these files:**
- `.env`
- `.env.local`
- `.env.*.local`

**Required for Dashboard:**
```env
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret
AUTH_SECRET=your_32_character_secret
AUTH_TRUST_HOST=true
AUTH_URL=http://localhost:3000
```

**Optional:**
```env
DATABASE_URL=postgresql://user:password@host:5432/database
ADMIN_EMAIL=admin@example.com
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token
```

### Security Best Practices

- ✅ All secrets stored in GCP Secret Manager (production)
- ✅ Environment variables for local development
- ✅ Comprehensive `.gitignore` patterns
- ✅ No hardcoded credentials
- ✅ Input validation on all endpoints
- ✅ Rate limiting to prevent abuse
- ✅ Security headers on all responses
- ✅ Audit logging for all security events

## 📊 Project Structure

```
sentinel-gcp/
├── sentinel-dashboard/          # Next.js Dashboard Application
│   ├── src/
│   │   ├── app/                 # Next.js App Router
│   │   │   ├── api/             # API routes
│   │   │   ├── dashboard/       # Dashboard pages
│   │   │   └── api-docs/        # API documentation
│   │   ├── components/          # React components
│   │   └── lib/                 # Utilities & helpers
│   ├── prisma/                  # Database schema
│   ├── scripts/                 # Deployment scripts
│   └── .github/                 # CI/CD workflows
│
├── services/                     # Backend Services
│   └── gateway/                 # API Gateway
│
├── src/                          # Shared core modules
│   └── core/                     # Core utilities
│
├── migrations/                   # Database migrations
├── docker-compose.yml            # Local development
├── deployment.yaml               # Kubernetes deployment
└── requirements.txt              # Python dependencies
```

## 🧪 Testing

### Dashboard

```bash
cd sentinel-dashboard

# Lint code
npm run lint

# Type check
npm run type-check

# Build for production
npm run build
```

### Backend Services

```bash
# Run tests (if configured)
pytest

# Load testing
locust -f locustfile.py
```

## 📈 Monitoring

### Health Checks

- **Dashboard**: `http://localhost:3000/api/health`
- **Metrics**: `http://localhost:3000/api/metrics` (admin only)

### Logging

- Structured JSON logging compatible with GCP Cloud Logging
- Request tracing with unique Request IDs
- Audit logs stored in database

## 🎯 Industry Standards

This project follows enterprise best practices:

- ✅ **Security**: OWASP Top 10 protection
- ✅ **Performance**: Optimized bundles, caching, CDN-ready
- ✅ **Scalability**: Stateless design, horizontal scaling
- ✅ **Observability**: Comprehensive logging and metrics
- ✅ **Reliability**: Error handling, health checks, graceful degradation
- ✅ **Maintainability**: TypeScript, linting, comprehensive documentation
- ✅ **CI/CD**: Automated testing and deployment

## 🛠️ Development

### Dashboard Development

```bash
cd sentinel-dashboard

# Start dev server
npm run dev

# Database studio
npm run db:studio

# Run migrations
npm run db:migrate
```

### Backend Development

```bash
# Activate virtual environment
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head
```

## 📄 License

Private - All rights reserved

## 🤝 Contributing

This is a private project. For questions or issues, contact the maintainer.

## 🔗 Links

- **Repository**: [https://github.com/Dhanush4448/sentinel-gcp](https://github.com/Dhanush4448/sentinel-gcp)
- **Dashboard Docs**: [sentinel-dashboard/README.md](./sentinel-dashboard/README.md)
- **API Docs**: Visit `/api-docs` in the running application

## 📞 Support

For setup assistance, see:
- [QUICK_START.md](./sentinel-dashboard/QUICK_START.md)
- [AUTH_SETUP.md](./sentinel-dashboard/AUTH_SETUP.md)
- [DATABASE_SETUP.md](./sentinel-dashboard/DATABASE_SETUP.md)

---

**Built with ❤️ using Next.js, TypeScript, PostgreSQL, and GCP**
