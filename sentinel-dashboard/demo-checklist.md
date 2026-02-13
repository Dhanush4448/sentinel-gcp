# ✅ Demo Checklist

Use this checklist during your demo to ensure you cover everything.

## Pre-Demo Setup

- [ ] Docker Desktop is running
- [ ] Database container is running: `docker ps | grep sentinel-dashboard-db`
- [ ] Dev server is running: `npm run dev`
- [ ] Prisma Studio is ready: `npm run db:studio`
- [ ] Browser DevTools are open (F12)
- [ ] Health check works: `http://localhost:3000/api/health`

## Demo Flow

### 1. Introduction (2 min)
- [ ] Show project structure
- [ ] Explain tech stack
- [ ] Show package.json dependencies

### 2. Health Check (1 min)
- [ ] Visit `/api/health`
- [ ] Show database status: "connected"
- [ ] Show response time
- [ ] Show memory usage

### 3. Authentication (3 min)
- [ ] Show login page
- [ ] Sign in with Google
- [ ] Show session endpoint: `/api/auth/session`
- [ ] Show session in Prisma Studio
- [ ] Show user in database

### 4. RBAC (2 min)
- [ ] Show current role in session
- [ ] Try accessing `/api/metrics` (should be 403 if not admin)
- [ ] Show RBAC code: `src/lib/rbac.ts`
- [ ] Explain permission system

### 5. Security Features (3 min)
- [ ] Show security headers in DevTools
- [ ] Show rate limiting code
- [ ] Show input validation code
- [ ] Explain CSRF protection

### 6. API Endpoints (3 min)
- [ ] Show `/api/logs` (authenticated)
- [ ] Show `/api/metrics` (admin only)
- [ ] Show `/api/auth/debug`
- [ ] Show error handling

### 7. Database (2 min)
- [ ] Show Prisma Studio
- [ ] Show User table
- [ ] Show Session table
- [ ] Show SecurityLog table
- [ ] Explain relationships

### 8. Error Handling (2 min)
- [ ] Show validation error
- [ ] Show unauthorized error
- [ ] Show error structure
- [ ] Explain request IDs

### 9. Monitoring (2 min)
- [ ] Show structured logs
- [ ] Show request IDs
- [ ] Show performance metrics
- [ ] Explain observability

### 10. Code Quality (2 min)
- [ ] Show TypeScript types
- [ ] Show ESLint config
- [ ] Show documentation
- [ ] Show CI/CD pipeline

### 11. Deployment (1 min)
- [ ] Show Dockerfile
- [ ] Show GCP config
- [ ] Show CI/CD workflow

## Key Features to Highlight

### Security
- [ ] OAuth authentication
- [ ] Database sessions
- [ ] RBAC
- [ ] Security headers
- [ ] Rate limiting
- [ ] Input validation
- [ ] Audit logging

### Performance
- [ ] Database connection pooling
- [ ] Response caching
- [ ] Code optimization
- [ ] Health monitoring

### Reliability
- [ ] Error handling
- [ ] Health checks
- [ ] Graceful degradation
- [ ] Request tracing

### Observability
- [ ] Structured logging
- [ ] Metrics endpoint
- [ ] Health checks
- [ ] Performance monitoring

### Code Quality
- [ ] TypeScript
- [ ] ESLint
- [ ] Documentation
- [ ] Best practices

## Quick Demo (5 min) - Must Cover

- [ ] Health check
- [ ] Authentication
- [ ] Security headers
- [ ] RBAC
- [ ] Database tables
- [ ] Error handling
- [ ] Code quality

## Post-Demo

- [ ] Answer questions
- [ ] Show code if requested
- [ ] Share documentation links
- [ ] Provide GitHub link (if public)

---

**Time Tracking:**
- Full Demo: 15-20 minutes
- Quick Demo: 5 minutes
- Code Deep Dive: +10 minutes
