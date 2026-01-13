FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY ./core-domain /app/core-domain
COPY ./backend/requirements.txt /app/backend/requirements.txt

RUN pip install --upgrade pip
RUN pip install -r /app/backend/requirements.txt
RUN pip install /app/core-domain

COPY ./backend /app/backend

WORKDIR /app/backend

COPY ./backend/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]