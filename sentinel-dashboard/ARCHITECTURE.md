# Architecture Documentation

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client Browser                       │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────────┐
│              GCP Cloud Run (Next.js App)                │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Middleware Layer                    │   │
│  │  • Route Protection                              │   │
│  │  • Rate Limiting                                 │   │
│  │  • Security Headers                              │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │            Application Layer                     │   │
│  │  • NextAuth (Authentication)                    │   │
│  │  • RBAC (Authorization)                         │   │
│  │  • API Routes                                    │   │
│  │  • Business Logic                               │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Data Layer                           │   │
│  │  • Prisma ORM                                    │   │
│  │  • Connection Pooling                            │   │
│  │  • Query Optimization                            │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────┬───────────────────────────┬───────────────┘
               │                           │
               ▼                           ▼
    ┌──────────────────┐      ┌──────────────────────┐
    │  GCP Secret       │      │  Cloud SQL           │
    │  Manager          │      │  (PostgreSQL)         │
    │                   │      │                      │
    │  • AUTH_SECRET    │      │  • Users              │
    │  • AUTH_GOOGLE_*  │      │  • Sessions           │
    │  • DATABASE_URL   │      │  • Security Logs      │
    └──────────────────┘      └──────────────────────┘
```

## Security Architecture

### Authentication Flow

```
1. User clicks "Sign in with Google"
   ↓
2. NextAuth redirects to Google OAuth
   ↓
3. User authenticates with Google
   ↓
4. Google redirects to /api/auth/callback/google
   ↓
5. NextAuth creates/updates User in database
   ↓
6. NextAuth creates Session in database
   ↓
7. Session cookie set in browser
   ↓
8. User redirected to dashboard
```

### Authorization Flow

```
1. Request arrives at middleware
   ↓
2. Check for session cookie
   ↓
3. If no cookie → redirect to sign-in
   ↓
4. If cookie exists → allow to route handler
   ↓
5. Route handler calls auth() to verify session
   ↓
6. Route handler checks RBAC permissions
   ↓
7. If authorized → process request
   ↓
8. If not authorized → return 403
```

## Data Flow

### Request Processing

```
Request
  ↓
Middleware (Rate Limit, Security Headers)
  ↓
Route Handler (Authentication, Authorization)
  ↓
Business Logic (Validation, Processing)
  ↓
Database (Prisma ORM)
  ↓
Response (Error Handling, Logging)
```

### Logging Flow

```
Event Occurs
  ↓
Logger.log() called
  ↓
Structured JSON created
  ↓
Console output (development) or Cloud Logging (production)
  ↓
Audit events also stored in database
```

## Database Schema

### Core Tables

- **User**: User accounts with roles
- **Account**: OAuth provider accounts
- **Session**: Active user sessions
- **VerificationToken**: Email verification
- **SecurityLog**: Audit and security events

### Relationships

```
User
  ├── accounts (1:N)
  ├── sessions (1:N)
  └── securityLogs (1:N)

Account → User (N:1)
Session → User (N:1)
SecurityLog → User (N:1, optional)
```

## Performance Optimizations

### Caching Strategy

- **In-Memory Cache**: API responses, computed values
- **TTL-based**: Automatic expiration
- **Cache Keys**: Function name + parameters hash

### Database Optimization

- **Connection Pooling**: Reuse connections
- **Indexes**: On frequently queried fields
- **Query Optimization**: Select only needed fields
- **Pagination**: Limit result sets

### Bundle Optimization

- **Code Splitting**: Automatic by Next.js
- **Tree Shaking**: Remove unused code
- **Dynamic Imports**: Load on demand
- **Image Optimization**: Next.js Image component

## Scalability Considerations

### Horizontal Scaling

- **Stateless Design**: No server-side state
- **Database Sessions**: Shared across instances
- **Load Balancing**: Cloud Run handles automatically
- **Connection Pooling**: Prevents connection exhaustion

### Vertical Scaling

- **Memory**: 512Mi (configurable)
- **CPU**: 1 vCPU (configurable)
- **Auto-scaling**: 0-10 instances (configurable)

## Monitoring & Observability

### Metrics Collected

- Request count and latency
- Database query performance
- Memory usage
- Error rates
- Rate limit hits

### Logging Levels

- **DEBUG**: Development debugging
- **INFO**: General information
- **WARN**: Warning conditions
- **ERROR**: Error conditions
- **CRITICAL**: Critical failures

### Health Checks

- **Liveness**: Service is running
- **Readiness**: Service can handle requests
- **Database**: Connection status
- **Memory**: Usage thresholds

## Security Layers

1. **Network**: HTTPS only (Cloud Run)
2. **Headers**: Security headers (CSP, HSTS, etc.)
3. **Authentication**: NextAuth session validation
4. **Authorization**: RBAC permission checks
5. **Rate Limiting**: Prevent abuse
6. **Input Validation**: Zod schemas
7. **Output Sanitization**: XSS prevention
8. **Audit Logging**: All security events

## Deployment Architecture

### Development

```
Local Machine
  ├── Next.js Dev Server
  ├── Local PostgreSQL (optional)
  └── Environment Variables (.env.local)
```

### Production

```
GCP Cloud Run
  ├── Containerized Next.js App
  ├── GCP Secret Manager (secrets)
  ├── Cloud SQL (database)
  └── Cloud Logging (logs)
```

## Error Handling Strategy

1. **Validation Errors**: 400 with details
2. **Authentication Errors**: 401
3. **Authorization Errors**: 403
4. **Not Found**: 404
5. **Rate Limit**: 429 with retry-after
6. **Server Errors**: 500 (sanitized in production)
7. **Service Unavailable**: 503

All errors include:
- Error code
- Human-readable message
- Request ID for tracing
- Optional details object
