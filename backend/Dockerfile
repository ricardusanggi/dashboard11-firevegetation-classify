# path: backend/Dockerfile

FROM python:3.11-slim

WORKDIR /app

# install dependency system (optional tapi sering dibutuhkan ML)
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# copy requirements
COPY requirements.txt .

# install python packages
RUN pip install --no-cache-dir --default-timeout=120 --retries 10 -r requirements.txt

# copy source code
COPY . .

# expose port
EXPOSE 8011

RUN mkdir -p \
    storage/databases \
    storage/models_train \
    storage/models_predict \
    storage/models_upload \
    storage/models_reject \
    storage/datasets_train \
    storage/datasets_pending \
    storage/datasets_reject \
    storage/datasets_test \
    storage/logs
    
# run server
CMD ["gunicorn", "app.main:app", \
     "-k", "uvicorn.workers.UvicornWorker", \
     "-w", "1", \
     "-b", "0.0.0.0:8011" ]