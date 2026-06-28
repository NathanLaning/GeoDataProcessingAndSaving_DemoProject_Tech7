FROM python:3.11-slim

WORKDIR /app

# Install watchdog for file monitoring
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src ./src

# Use watchmedo to auto-restart on file changes
CMD ["watchmedo", "auto-restart", "-d", "src", "-p", "*.py", "--", "python", "-u", "src/main.py"]
