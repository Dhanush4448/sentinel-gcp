# Use a slim Python image for a smaller footprint
FROM python:3.12-slim

# Set the working directory inside the container
WORKDIR /app

# Copy requirements from the specific service folder to the container root
# Note: Path is relative to the 'context' defined in docker-compose.yml
COPY services/gateway/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire project into /app
# This ensures 'src' and 'services' folders are available
COPY . .

# Expose the port the app runs on
EXPOSE 8000

# Set PYTHONPATH so 'from src.core...' imports work correctly
ENV PYTHONPATH=/app

# Start the application
CMD ["uvicorn", "services.gateway.main:app", "--host", "0.0.0.0", "--port", "8000"]