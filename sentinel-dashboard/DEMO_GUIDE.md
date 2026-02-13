# Sentinel Dashboard - Demo Guide

## 🎬 Complete Demo Walkthrough

This guide will help you showcase all features of the Sentinel Dashboard in a professional demo.

---

## 📋 Pre-Demo Checklist

Before starting the demo, ensure:

- [ ] Docker Desktop is running
- [ ] Database container is running (`docker ps` should show `sentinel-dashboard-db-1`)
- [ ] Development server is running (`npm run dev`)
- [ ] Application is accessible at `http://localhost:3000`
- [ ] Health check shows database connected: `http://localhost:3000/api/health`

---

## 🎯 Demo Flow (15-20 minutes)

### 1. **Introduction & Architecture Overview** (2 min)

**What to Show:**
- Open the project in your IDE
- Show the project structure
- Explain the tech stack

**What to Say:**
> "This is Sentinel Dashboard, an enterprise-grade security monitoring platform. It's built with Next.js 16, TypeScript, PostgreSQL, and follows industry best practices. Let me show you the architecture and key features."

**Files to Highlight:**
- `package.json` - Show dependencies
- `src/app/api/` - Show API routes structure
- `prisma/schema.prisma` - Show database schema
- `src/lib/` - Show utility modules (security, rbac, logger, etc.)

---

### 2. **Health Check & System Status** (1 min)

**URL:** `http://localhost:3000/api/health`

**What to Show:**
- Open browser DevTools (F12) → Network tab
- Visit the health endpoint
- Show the JSON response

**What to Highlight:**
```json
{
  "status": "healthy",
  "services": {
    "database": {
      "status": "connected",
      "responseTime": 245
    },
    "memory": {
      "used": 118,
      "total": 166,
      "percentage": 71
    }
  }
}
```

**What to Say:**
> "The health check endpoint shows our system status. Notice the database is connected with a 245ms response time, and we're monitoring memory usage. This is essential for production monitoring."

---

### 3. **Authentication Flow** (3 min)

**URL:** `http://localhost:3000`

**Step-by-Step:**

1. **Show the Login Page**
   - Visit `http://localhost:3000`
   - Point out the "Sign in with Google" button
   - Explain: "This uses NextAuth v5 with Google OAuth"

2. **Sign In Process**
   - Click "Sign in with Google"
   - Complete Google OAuth flow
   - Show the redirect back to the app

3. **Verify Session**
   - Visit: `http://localhost:3000/api/auth/session`
   - Show the session JSON:
   ```json
   {
     "user": {
       "id": "...",
       "name": "Your Name",
       "email": "your@email.com",
       "role": "USER"
     }
   }
   ```

4. **Show Database Session**
   - Open Prisma Studio: `npm run db:studio`
   - Navigate to `Session` table
   - Show: "Sessions are stored in PostgreSQL, not just cookies"
   - Navigate to `User` table
   - Show: "User data is persisted in the database"

**What to Say:**
> "The authentication uses NextAuth v5 with Google OAuth. Notice that sessions are stored in PostgreSQL, making them persistent across server restarts. This is enterprise-grade session management."

---

### 4. **Role-Based Access Control (RBAC)** (2 min)

**What to Show:**

1. **Check Current Role**
   - Visit: `http://localhost:3000/api/auth/session`
   - Show the `role` field (likely "USER")

2. **Try Accessing Admin Endpoint**
   - Visit: `http://localhost:3000/api/metrics`
   - Show the 403 Forbidden response (if not admin)
   - Explain: "This endpoint requires ADMIN role"

3. **Show RBAC Implementation**
   - Open: `src/lib/rbac.ts`
   - Explain the permission system
   - Show: `src/app/api/metrics/route.ts` - Show the `requirePermission` call

**What to Say:**
> "We have Role-Based Access Control with 4 roles: USER, ADMIN, MODERATOR, and VIEWER. Each API endpoint checks permissions before allowing access. This prevents unauthorized access to sensitive data."

---

### 5. **Security Features** (3 min)

**A. Security Headers**

1. Open browser DevTools → Network tab
2. Visit any page
3. Click on a request → Headers tab
4. Show security headers:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `X-XSS-Protection: 1; mode=block`
   - `Strict-Transport-Security: ...`
   - `Content-Security-Policy: ...`

**What to Say:**
> "All responses include security headers that protect against XSS, clickjacking, and other attacks. This is configured in our middleware."

**B. Rate Limiting**

1. Open: `src/app/api/logs/route.ts`
2. Show the rate limiting code:
   ```typescript
   const rateLimitResult = await rateLimit(clientId, {
     maxRequests: 30,
     windowMs: 60000, // 1 minute
   });
   ```
3. Explain: "This prevents API abuse by limiting requests per IP"

**C. Input Validation**

1. Open: `src/lib/validation.ts`
2. Show Zod schemas
3. Explain: "All inputs are validated using Zod schemas before processing"

---

### 6. **API Endpoints** (3 min)

**A. Logs API** (Protected)

1. Visit: `http://localhost:3000/api/logs`
2. If not authenticated, show 401 Unauthorized
3. After authentication, show the logs response
4. Try query parameters:
   - `http://localhost:3000/api/logs?page=1&limit=10`
   - `http://localhost:3000/api/logs?severity=ERROR`

**What to Say:**
> "The logs API is protected by authentication and RBAC. It supports pagination and filtering. Notice the rate limiting and input validation."

**B. Metrics API** (Admin Only)

1. Visit: `http://localhost:3000/api/metrics`
2. Show 403 if not admin
3. If admin, show the metrics:
   ```json
   {
     "system": {
       "uptime": 1234,
       "memory": {...}
     },
     "database": {
       "connected": true,
       "users": 5,
       "activeSessions": 2
     }
   }
   ```

**C. Auth Debug Endpoint**

1. Visit: `http://localhost:3000/api/auth/debug`
2. Show database connection status
3. Show table information

---

### 7. **Database & Persistence** (2 min)

**What to Show:**

1. **Prisma Studio**
   - Run: `npm run db:studio`
   - Show the database tables:
     - `User` - User accounts with roles
     - `Session` - Active sessions
     - `Account` - OAuth provider accounts
     - `SecurityLog` - Audit logs

2. **Database Schema**
   - Open: `prisma/schema.prisma`
   - Explain the relationships
   - Show indexes and constraints

3. **Create a Security Log**
   - Sign in (creates a log entry)
   - Show in Prisma Studio → `SecurityLog` table
   - Explain: "All security events are logged for audit purposes"

**What to Say:**
> "All data is persisted in PostgreSQL. Sessions, users, and security logs are stored in the database. This enables horizontal scaling and data persistence."

---

### 8. **Error Handling** (2 min)

**What to Show:**

1. **Invalid Request**
   - Visit: `http://localhost:3000/api/logs?page=invalid`
   - Show the validation error response:
   ```json
   {
     "error": {
       "code": "VALIDATION_ERROR",
       "message": "Invalid query parameters",
       "requestId": "..."
     }
   }
   ```

2. **Unauthorized Access**
   - Visit: `http://localhost:3000/api/metrics` (without auth)
   - Show 401 response

3. **Error Implementation**
   - Open: `src/lib/errors.ts`
   - Show the error handling system
   - Explain: "All errors include error codes, messages, and request IDs for tracing"

**What to Say:**
> "We have standardized error handling. Every error includes an error code, human-readable message, and request ID for tracing. This makes debugging easier in production."

---

### 9. **Monitoring & Observability** (2 min)

**What to Show:**

1. **Structured Logging**
   - Open terminal where server is running
   - Show the structured JSON logs
   - Explain: "Logs are in JSON format, compatible with GCP Cloud Logging"

2. **Request Tracing**
   - Make an API request
   - Show the `X-Request-ID` header in response
   - Explain: "Every request has a unique ID for tracing"

3. **Performance Monitoring**
   - Visit: `http://localhost:3000/api/health`
   - Show response time
   - Explain: "We track response times and database query performance"

**What to Say:**
> "The application includes comprehensive observability. Structured logging, request tracing, and performance monitoring enable us to debug issues and optimize performance in production."

---

### 10. **Code Quality & Best Practices** (2 min)

**What to Show:**

1. **TypeScript**
   - Open any `.ts` file
   - Show type definitions
   - Explain: "Full TypeScript for type safety"

2. **Linting & Formatting**
   - Run: `npm run lint`
   - Show ESLint configuration
   - Explain: "Code quality is enforced with ESLint and Prettier"

3. **Documentation**
   - Show the various `.md` files:
     - `README.md`
     - `ARCHITECTURE.md`
     - `API_DOCUMENTATION.md`
     - `DEMO_GUIDE.md` (this file)

**What to Say:**
> "The codebase follows industry best practices: TypeScript for type safety, ESLint for code quality, and comprehensive documentation. This makes it maintainable and scalable."

---

### 11. **Deployment Ready** (1 min)

**What to Show:**

1. **Docker**
   - Show: `Dockerfile`
   - Explain: "The application is containerized for easy deployment"

2. **GCP Configuration**
   - Show: `cloudbuild.yaml`
   - Show: `deploy.ps1`
   - Explain: "Ready for GCP Cloud Run deployment with Secret Manager"

3. **CI/CD**
   - Show: `.github/workflows/ci.yml`
   - Explain: "Automated testing and deployment pipeline"

**What to Say:**
> "The application is production-ready. It's containerized with Docker, configured for GCP Cloud Run, and has CI/CD pipelines for automated deployment."

---

## 🎬 Quick Demo Script (5 minutes)

If you only have 5 minutes, focus on:

1. **Health Check** (30 sec)
   - `http://localhost:3000/api/health`
   - Show database connected

2. **Authentication** (1 min)
   - Sign in with Google
   - Show session in database (Prisma Studio)

3. **Security Features** (1 min)
   - Show security headers (DevTools)
   - Show rate limiting code
   - Show RBAC in action (try `/api/metrics`)

4. **API Endpoints** (1 min)
   - Show `/api/logs` with authentication
   - Show error handling

5. **Database** (1 min)
   - Prisma Studio showing tables
   - Show security logs

6. **Code Quality** (30 sec)
   - Show TypeScript types
   - Show documentation

---

## 📊 Demo Checklist

Use this checklist to ensure you cover everything:

### Core Features
- [ ] Health check endpoint working
- [ ] Authentication flow (Google OAuth)
- [ ] Session stored in database
- [ ] RBAC demonstration
- [ ] Security headers visible
- [ ] Rate limiting explained
- [ ] Input validation shown

### API Endpoints
- [ ] `/api/health` - System status
- [ ] `/api/auth/session` - Current session
- [ ] `/api/logs` - Security logs (authenticated)
- [ ] `/api/metrics` - System metrics (admin)
- [ ] `/api/auth/debug` - Diagnostics

### Database
- [ ] Prisma Studio showing tables
- [ ] User table with roles
- [ ] Session table with active sessions
- [ ] SecurityLog table with audit entries

### Code Quality
- [ ] TypeScript types shown
- [ ] Error handling demonstrated
- [ ] Documentation referenced
- [ ] Security implementation shown

### Deployment
- [ ] Dockerfile mentioned
- [ ] GCP configuration shown
- [ ] CI/CD pipeline referenced

---

## 💡 Pro Tips for Demo

1. **Prepare in Advance**
   - Test all features before the demo
   - Have Prisma Studio ready
   - Have browser DevTools open

2. **Tell a Story**
   - Start with the problem (need for secure dashboard)
   - Show the solution (your implementation)
   - Highlight the benefits (enterprise-grade features)

3. **Show, Don't Just Tell**
   - Actually click buttons and navigate
   - Show code, not just talk about it
   - Use real data, not placeholders

4. **Handle Questions**
   - Be ready to explain technical decisions
   - Know where security features are implemented
   - Understand the architecture

5. **Highlight Enterprise Features**
   - Security (headers, validation, rate limiting)
   - Observability (logging, metrics, tracing)
   - Scalability (stateless, database sessions)
   - Maintainability (TypeScript, documentation)

---

## 🎥 Recording a Demo Video

If recording a demo video:

1. **Screen Recording Setup**
   - Use OBS Studio or similar
   - Record at 1080p minimum
   - Show code editor and browser side-by-side

2. **Audio**
   - Use a good microphone
   - Speak clearly and at moderate pace
   - Explain what you're doing

3. **Structure**
   - Introduction (30 sec)
   - Architecture overview (1 min)
   - Feature walkthrough (10-15 min)
   - Code deep dive (5 min)
   - Conclusion (30 sec)

4. **Editing**
   - Add text overlays for key points
   - Highlight important code sections
   - Add transitions between sections

---

## 📝 Demo Script Template

```
[INTRODUCTION]
"Hi, I'm [Your Name], and today I'll be demonstrating Sentinel Dashboard, 
an enterprise-grade security monitoring platform I built."

[ARCHITECTURE]
"Let me start by showing you the architecture..."

[FEATURES]
"Now let's see the key features in action..."

[CODE WALKTHROUGH]
"Let me show you how this is implemented..."

[CONCLUSION]
"In summary, this project demonstrates enterprise-level development skills..."
```

---

## 🚀 Quick Start Commands

```powershell
# 1. Start database
docker-compose up -d db

# 2. Start dev server
npm run dev

# 3. Open Prisma Studio (in another terminal)
npm run db:studio

# 4. Visit application
# http://localhost:3000
```

---

## ✅ Final Checklist Before Demo

- [ ] Server is running and accessible
- [ ] Database is connected (check `/api/health`)
- [ ] Can sign in with Google
- [ ] Prisma Studio is ready
- [ ] Browser DevTools are open
- [ ] All documentation files are accessible
- [ ] Code editor is open with project
- [ ] Terminal is ready for commands

---

**Good luck with your demo! 🎉**
