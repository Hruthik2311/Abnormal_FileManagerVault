# Use Python 3.9
FROM python:3.9-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the current directory contents into the container
COPY . /app/

# Ensure the data directory exists before running the app
RUN mkdir -p /app/data

# Create a script to run migrations and start the server
RUN echo '#!/bin/bash\n\
python manage.py makemigrations\n\
python manage.py migrate\n\
python manage.py runserver 0.0.0.0:8000' > /app/start.sh && \
chmod +x /app/start.sh

# Expose port 8000
EXPOSE 8000

# Start the application
CMD ["/app/start.sh"]
