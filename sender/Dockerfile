FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src ./src

CMD ["watchmedo", "auto-restart", "-d", "src", "-p", "*.py", "--", "python", "-u", "src/main.py"]
