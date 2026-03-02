-- Database Structure and Data View

-- 1. List all tables
\dt

-- 2. User table structure
\d+ "User"

-- 3. Session table structure  
\d+ "Session"

-- 4. Account table structure
\d+ "Account"

-- 5. SecurityLog table structure
\d+ "SecurityLog"

-- 6. VerificationToken table structure
\d+ "VerificationToken"

-- 7. Count records in each table
SELECT 'User' as table_name, COUNT(*) as record_count FROM "User"
UNION ALL
SELECT 'Session', COUNT(*) FROM "Session"
UNION ALL
SELECT 'Account', COUNT(*) FROM "Account"
UNION ALL
SELECT 'SecurityLog', COUNT(*) FROM "SecurityLog"
UNION ALL
SELECT 'VerificationToken', COUNT(*) FROM "VerificationToken";

-- 8. Sample User data
SELECT id, email, role, "createdAt" FROM "User" LIMIT 5;

-- 9. Sample Session data
SELECT id, "sessionToken", "userId", expires FROM "Session" LIMIT 5;

-- 10. Sample SecurityLog data
SELECT id, "user_id", action, tier, severity, timestamp FROM "SecurityLog" ORDER BY timestamp DESC LIMIT 10;
