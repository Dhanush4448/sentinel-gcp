import os
import time
import logging
import redis.asyncio as redis
from fastapi import FastAPI, Request, Response, HTTPException, Header, Depends
from typing import Optional
from circuitbreaker import circuit
from pythonjsonlogger import jsonlogger
from sqlalchemy import create_engine, Column, String, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# Import the logic you just created in src/core
from src.core.limiter import SlidingWindowLimiter

# 1. DATABASE CONFIGURATION
DATABASE_URL = f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}/{os.getenv('DB_NAME')}"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# User Model for PostgreSQL
class User(Base):
    __tablename__ = "users"
    api_key = Column(String, primary_key=True, index=True)
    user_id = Column(String)
    tier = Column(String, default="free")

# 2. OBSERVABILITY: Structured JSON Logging
log_handler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter('%(asctime)s %(levelname)s %(message)s %(user_id)s %(tier)s %(latency_ms)s')
log_handler.setFormatter(formatter)
logger = logging.getLogger("sentinel-gcp")
logger.addHandler(log_handler)
logger.setLevel(logging.INFO)

app = FastAPI(title="Sentinel-GCP Gateway")

# Redis Client
redis_client = redis.Redis(host=os.getenv("REDIS_HOST"), port=6379, decode_responses=True)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 3. RESILIENCE: Distributed Rate Limiting with Circuit Breaker
@circuit(failure_threshold=5, recovery_timeout=60)
async def check_rate_limit(user_id, limit, window):
    """
    Acts as the 'Protective Shield'. 
    If Redis fails 5 times, the circuit opens and this function 
    is bypassed by the try/except block in the endpoint (Fail-Open).
    """
    limiter_instance = SlidingWindowLimiter(redis_client)
    return await limiter_instance.check_limit(user_id, limit, window)

@app.get("/shield")
async def protected_endpoint(
    request: Request, 
    x_api_key: Optional[str] = Header(None), 
    db: Session = Depends(get_db)
):
    start_time = time.time()
    user_id = "anonymous"
    tier = "free"

    try:
        # Emergency Kill Switch
        if await redis_client.get("config:kill_switch") == "true":
            raise HTTPException(status_code=503, detail="Global Block Active")

        if not x_api_key:
            raise HTTPException(status_code=401, detail="Missing API Key")

        # CACHE-ASIDE PATTERN: Check Redis for User ID mapping first
        user_id = await redis_client.get(f"auth:key:{x_api_key}")
        
        if not user_id:
            # Cache Miss: Query PostgreSQL (Source of Truth)
            db_user = db.query(User).filter(User.api_key == x_api_key).first()
            if not db_user:
                raise HTTPException(status_code=403, detail="Invalid API Key")
            
            user_id = db_user.user_id
            tier = db_user.tier
            # Populate Cache for next time
            await redis_client.set(f"auth:key:{x_api_key}", user_id, ex=3600)
            await redis_client.set(f"user:tier:{user_id}", tier, ex=3600)
        else:
            # Cache Hit: Get tier from Redis
            tier = await redis_client.get(f"user:tier:{user_id}") or "free"

        # Define limits based on Tier
        limit = 100 if tier == "pro" else 5

        # 4. DISTRIBUTED RATE LIMITING
        allowed, retry_after = await check_rate_limit(user_id, limit, 60)
        
        latency = (time.time() - start_time) * 1000
        
        if not allowed:
            logger.info("Request blocked", extra={
                "user_id": user_id, "tier": tier, "latency_ms": f"{latency:.2f}", "result": "blocked"
            })
            return Response(status_code=429, headers={"Retry-After": str(retry_after)})
            
        logger.info("Request processed", extra={
            "user_id": user_id, "tier": tier, "latency_ms": f"{latency:.2f}", "result": "allowed"
        })
        
        return {"status": "success", "user": user_id, "tier": tier}

    except Exception as e:
        # 5. FAIL-OPEN: Maintain availability if Redis or DB is down
        latency = (time.time() - start_time) * 1000
        logger.error("Gateway error - Failing Open", extra={
            "user_id": user_id, "tier": tier, "latency_ms": f"{latency:.2f}", "error": str(e)
        })
        return {"status": "degraded", "message": "Access granted via fail-open"}