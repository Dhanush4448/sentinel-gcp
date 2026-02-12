FROM python:3.12-slim
WORKDIR /app/services/gateway

RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

# Added python-json-logger and common gateway utilities
RUN echo "fastapi\nuvicorn\nsqlalchemy\npsycopg2-binary\nredis\nalembic\ncircuitbreaker\npython-jose\npasslib\npython-json-logger\npydantic-settings" > requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app
ENV PYTHONPATH=/app/services/gateway:/app
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]