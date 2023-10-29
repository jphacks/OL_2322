FROM python:3.8-slim
WORKDIR /usr/src/app
COPY requirements.txt ./
RUN apt-get update && apt-get install -y libpq-dev
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt
COPY . .