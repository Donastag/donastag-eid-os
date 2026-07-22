FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY main.py .
RUN useradd --create-home --shell /bin/bash appuser
USER appuser
EXPOSE 8005
CMD ["python", "main.py"]
