from locust import HttpUser, task, between

class SentinelUser(HttpUser):
    # Simulate a user making a request every 0.1 to 1.0 seconds
    wait_time = between(0.1, 1.0) 

    @task
    def access_gateway(self):
        # Uses the Pro API Key we successfully inserted into PostgreSQL
        headers = {"X-API-Key": "dhanush-pro-key"}
        
        # This hits the gateway endpoint to test rate limiting and caching
        self.client.get("/shield", headers=headers)