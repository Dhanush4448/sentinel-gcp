import time
from redis.asyncio import Redis

class SlidingWindowLimiter:
    def __init__(self, redis_client: Redis):
        self.redis = redis_client

    async def check_limit(self, key: str, limit: int, window: int):
        """
        Returns (allowed: bool, retry_after: int)
        """
        now = time.time()
        redis_key = f"limiter:{key}"
        
        async with self.redis.pipeline(transaction=True) as pipe:
            # 1. Clean up old timestamps
            pipe.zremrangebyscore(redis_key, 0, now - window)
            # 2. Get current count
            pipe.zcard(redis_key)
            # 3. Get the oldest timestamp to calculate wait time
            pipe.zrange(redis_key, 0, 0) 
            # 4. Add current attempt
            pipe.zadd(redis_key, {str(now): now})
            # 5. Refresh TTL
            pipe.expire(redis_key, window)
            
            results = await pipe.execute()
            
        current_count = results[1]
        
        if current_count >= limit:
            # Find the oldest request time in the window
            oldest_request_list = results[2]
            
            if oldest_request_list:
                oldest_request_time = float(oldest_request_list[0])
                # Seconds until the oldest request is removed from the window
                retry_after = int(window - (now - oldest_request_time))
                return False, max(1, retry_after)
            
            return False, window # Fallback if list was empty
            
        return True, 0