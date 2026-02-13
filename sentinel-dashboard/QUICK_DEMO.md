# 🎬 Quick Demo Script (5 Minutes)

## Step-by-Step Demo Walkthrough

### 1. **Start Everything** (30 seconds)

```powershell
# Terminal 1: Start database
docker-compose up -d db

# Terminal 2: Start server
npm run dev

# Terminal 3: Open Prisma Studio
npm run db:studio
```

**Say:** "I've started the database, development server, and database viewer. Let me show you what we have."

---

### 2. **Health Check** (30 seconds)

**Action:**
- Open browser: `http://localhost:3000/api/health`
- Show the JSON response

**Say:** "First, let's check system health. Notice the database is connected with a 245ms response time, and we're monitoring memory usage. This is essential for production monitoring."

**Highlight:**
- Database status: "connected"
- Response time
- Memory usage

---

### 3. **Authentication** (1 minute)

**Action:**
1. Visit: `http://localhost:3000`
2. Click "Sign in with Google"
3. Complete OAuth flow
4. Show session: `http://localhost:3000/api/auth/session`
5. Open Prisma Studio → Show `Session` and `User` tables

**Say:** "The authentication uses NextAuth v5 with Google OAuth. Notice that sessions are stored in PostgreSQL, not just cookies. This makes them persistent across server restarts - that's enterprise-grade session management."

**Highlight:**
- OAuth flow
- Session in database
- User record created

---

### 4. **Security Features** (1 minute)

**Action:**
1. Open browser DevTools (F12) → Network tab
2. Visit any page
3. Click on request → Headers tab
4. Show security headers:
   - `X-Content-Type-Options`
   - `X-Frame-Options`
   - `Content-Security-Policy`
   - `Strict-Transport-Security`

**Say:** "All responses include security headers that protect against XSS, clickjacking, and other attacks. This is configured in our middleware and follows OWASP best practices."

**Then show code:**
- Open: `src/lib/security.ts`
- Show the security headers implementation

---

### 5. **RBAC & Protected Endpoints** (1 minute)

**Action:**
1. Visit: `http://localhost:3000/api/metrics`
2. Show 403 Forbidden (if not admin) or metrics (if admin)
3. Visit: `http://localhost:3000/api/logs`
4. Show logs response (if authenticated)

**Say:** "We have Role-Based Access Control. The metrics endpoint requires ADMIN role, while logs require authentication. Each endpoint checks permissions before allowing access."

**Show code:**
- Open: `src/lib/rbac.ts`
- Show permission definitions
- Open: `src/app/api/metrics/route.ts`
- Show `requirePermission` call

---

### 6. **Database & Persistence** (1 minute)

**Action:**
1. In Prisma Studio, show:
   - `User` table (with your user)
   - `Session` table (active session)
   - `SecurityLog` table (audit logs from sign-in)

**Say:** "All data is persisted in PostgreSQL. When you signed in, it created a user record, a session record, and a security log entry. This enables audit trails and horizontal scaling."

**Highlight:**
- User with role
- Active session
- Security log entry

---

### 7. **Error Handling** (30 seconds)

**Action:**
1. Visit: `http://localhost:3000/api/logs?page=invalid`
2. Show validation error:
   ```json
   {
     "error": {
       "code": "VALIDATION_ERROR",
       "message": "Invalid query parameters",
       "requestId": "..."
     }
   }
   ```

**Say:** "We have standardized error handling. Every error includes an error code, message, and request ID for tracing. This makes debugging easier in production."

---

### 8. **Code Quality** (30 seconds)

**Action:**
1. Show TypeScript in any file
2. Show documentation files
3. Run: `npm run lint` (quickly)

**Say:** "The codebase follows industry best practices: TypeScript for type safety, ESLint for code quality, and comprehensive documentation. This makes it maintainable and scalable."

---

## 🎯 Key Points to Emphasize

1. **Enterprise-Grade Security**
   - OAuth authentication
   - RBAC authorization
   - Security headers
   - Rate limiting
   - Input validation

2. **Production-Ready**
   - Database persistence
   - Error handling
   - Health monitoring
   - Structured logging

3. **Scalable Architecture**
   - Stateless design
   - Database sessions
   - Connection pooling
   - Containerized

4. **Developer Experience**
   - TypeScript
   - Documentation
   - CI/CD ready
   - Best practices

---

## 📋 Quick Checklist

- [ ] Health check shows database connected
- [ ] Can sign in with Google
- [ ] Session visible in database
- [ ] Security headers visible in DevTools
- [ ] RBAC working (403 on admin endpoint)
- [ ] Error handling shows proper format
- [ ] Prisma Studio shows all tables
- [ ] Code quality tools mentioned

---

## 💬 Closing Statement

> "In summary, Sentinel Dashboard demonstrates enterprise-level development skills: secure authentication, role-based access control, comprehensive error handling, database persistence, and production-ready architecture. It's built with modern technologies and follows industry best practices for security, performance, and maintainability."

---

**Total Time: ~5 minutes**
