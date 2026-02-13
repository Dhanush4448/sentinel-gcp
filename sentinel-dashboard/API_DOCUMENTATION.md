# API Documentation

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://your-service.run.app`

## Authentication

All protected endpoints require authentication via NextAuth session cookie.

### Headers

```
Cookie: authjs.session-token=<session-token>
```

## Rate Limiting

- **Default**: 10 requests per 10 seconds per IP
- **Sensitive routes**: 20 requests per minute
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {},
    "requestId": "req_1234567890_abc123"
  }
}
```

### Error Codes

- `UNAUTHORIZED` (401) - Authentication required
- `FORBIDDEN` (403) - Insufficient permissions
- `VALIDATION_ERROR` (400) - Invalid input
- `NOT_FOUND` (404) - Resource not found
- `RATE_LIMIT_EXCEEDED` (429) - Too many requests
- `INTERNAL_ERROR` (500) - Server error
- `DATABASE_ERROR` (503) - Database unavailable

## Endpoints

### Health Check

**GET** `/api/health`

Public endpoint to check service health.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "services": {
    "database": {
      "status": "connected",
      "responseTime": 5
    },
    "memory": {
      "used": 150,
      "total": 512,
      "percentage": 29
    }
  },
  "uptime": 3600
}
```

### Get Logs

**GET** `/api/logs`

Retrieve security logs with pagination and filtering.

**Authentication**: Required  
**Permissions**: `read:logs`

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10, max: 100) - Items per page
- `severity` (string, optional) - Filter by severity: DEBUG, INFO, WARN, ERROR, CRITICAL
- `userId` (string, optional) - Filter by user ID
- `startDate` (ISO date, optional) - Start date filter
- `endDate` (ISO date, optional) - End date filter

**Response:**
```json
{
  "data": [
    {
      "id": "clx...",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "action": "USER_SIGNIN",
      "severity": "INFO",
      "user": {
        "id": "clx...",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ],
  "metadata": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10,
    "requestId": "req_1234567890_abc123"
  }
}
```

### Metrics

**GET** `/api/metrics`

Get system metrics (admin only).

**Authentication**: Required  
**Permissions**: `admin:all`

**Response:**
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "system": {
    "uptime": 3600,
    "memory": {
      "heapUsed": 150,
      "heapTotal": 512,
      "rss": 256
    },
    "nodeVersion": "v20.0.0",
    "platform": "linux"
  },
  "database": {
    "connected": true,
    "users": 50,
    "activeSessions": 25,
    "totalLogs": 1000
  }
}
```

### Auth Test

**GET** `/api/auth/test`

Check authentication configuration.

**Response:**
```json
{
  "status": "OK",
  "checks": {
    "AUTH_GOOGLE_ID": true,
    "AUTH_GOOGLE_SECRET": true,
    "AUTH_SECRET": true,
    "AUTH_TRUST_HOST": true,
    "AUTH_URL": "http://localhost:3000"
  },
  "callbackUrl": "http://localhost:3000/api/auth/callback/google"
}
```

### Auth Debug

**GET** `/api/auth/debug`

Debug authentication and database status.

**Response:**
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": {
    "url_set": true,
    "connected": true,
    "tables": ["User", "Session", "Account", "SecurityLog"],
    "has_user_table": true,
    "has_session_table": true
  }
}
```

## Response Headers

All responses include:

- `X-Request-ID` - Unique request identifier
- `X-Response-Time` - Response time in milliseconds
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Content-Security-Policy` - CSP header
- `Strict-Transport-Security` - HSTS (production only)

## Status Codes

- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error
- `503` - Service Unavailable
