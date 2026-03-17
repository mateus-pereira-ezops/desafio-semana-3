# Week 3 – Containers (Docker + Docker Compose + Nginx)

## Objective

Containerize a web application and orchestrate multiple services using **Docker** and **Docker Compose**, simulating an architecture closer to real production environments.

The application is split into **frontend**, **backend**, **database**, and **reverse proxy**, demonstrating inter-service communication within a Docker network.

---

# Architecture

```
Browser
   ↓
Nginx (Reverse Proxy)
   ↓
Frontend (Next.js)    Backend (Express API)
                             ↓
                        PostgreSQL
```

- **Nginx**: acts as a reverse proxy and the application's entry point.
- **Frontend**: Next.js application responsible for the web interface.
- **Backend**: Express API responsible for accessing the database and exposing metrics.
- **Database**: PostgreSQL running in a separate container.
- **Prometheus**: scrapes metrics from the backend every 15 seconds.
- **Grafana**: visualizes metrics collected by Prometheus.
- **Alertmanager**: routes alerts to Discord via webhook.

All services communicate through an **internal Docker network**.

---

# Project Structure

```
.
├── .github
│   └── workflows
│       ├── ci.yml
│       ├── build.yml
│       └── deploy.yml
├── docker-compose.yml
├── nginx
│   └── default.conf
├── observability
│   ├── prometheus
│   │   ├── prometheus.yml
│   │   └── alerts.yml
│   └── alertmanager
│       └── alertmanager.yml
├── frontend
│   ├── Dockerfile
│   ├── package.json
│   └── app/
├── backend
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       └── index.js
├── .env
└── .env.discord
```

---

# Services

## Nginx (Reverse Proxy)

Nginx acts as the **application gateway**, forwarding requests to internal services.

Routing rules:

- `/` → **Frontend (Next.js)**
- `/api/*` → **Backend (Express)**

This allows exposing **only one public service**, keeping the backend and database isolated within the Docker network.

---

## Frontend

Application built with **Next.js**, responsible for rendering the web interface and consuming the API.

The container uses a **multi-stage build** to simulate a production-like environment.

### Dockerfile (summary)

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app ./
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Backend

A REST API built with **Express**, responsible for connecting to the PostgreSQL database and exposing Prometheus metrics via `prom-client`.

Implemented endpoints:

```
GET  /api/health
GET  /api/db-time
GET  /api/tasks
POST /api/tasks
GET  /api/tasks/:id
PUT  /api/tasks/:id
DELETE /api/tasks/:id
GET  /api/fail        ← simulates a 500 error for alert testing
GET  /metrics         ← Prometheus scrape endpoint
```

Metrics exposed via `prom-client`:

| Metric | Type | Description |
|--------|------|-------------|
| `process_cpu_seconds_total` | counter | CPU usage of the Node.js process |
| `process_resident_memory_bytes` | gauge | RAM usage of the Node.js process |
| `http_requests_total` | counter | Total HTTP requests by method, route and status code |
| `http_request_duration_seconds` | histogram | Request latency in seconds |
| `nodejs_eventloop_lag_seconds` | gauge | Event loop health |

---

## Database

**PostgreSQL** database running in a container using the official image:

```
postgres:16-alpine
```

Data persistence is ensured through a **Docker volume**.

---

## Observability Stack

### Prometheus

Scrapes metrics from the backend every 15 seconds and evaluates alerting rules.

Configuration: `observability/prometheus/prometheus.yml`

### Grafana

Visualizes metrics collected by Prometheus. Dashboards include:

- Requests per second
- 5xx error rate
- p95 latency
- RAM usage
- CPU usage

Access: `http://localhost:3000` (default credentials: `admin` / `admin`)

### Alertmanager

Routes alerts from Prometheus to Discord via the `benjojo/alertmanager-discord` webhook adapter.

Configured alerts:

| Alert | Condition | Severity |
|-------|-----------|----------|
| `ServiceDown` | Backend unreachable for 15s | critical |
| `HighErrorRate` | 5xx rate > 5% for 1 minute | warning |
| `HighMemoryUsage` | RAM > 150MB for 2 minutes | warning |

Discord notifications include both **firing** (🔴) and **resolved** (🟢) states.

The Discord webhook URL is stored in `.env.discord` and never committed to the repository.

---

# Docker Compose

The `docker-compose.yml` defines seven services:

- `nginx`
- `frontend`
- `backend`
- `db`
- `prometheus`
- `grafana`
- `alertmanager`
- `discord-webhook-adapter`

Key features used:

- **custom image builds**
- **internal Docker network**
- **reverse proxy**
- **environment variables**
- **healthchecks**
- **volumes for persistence**
- **metrics scraping and alerting**

---

# CI/CD Pipeline

The project uses **GitHub Actions** with three sequential workflows, each triggered by the successful completion of the previous one.

```
Push to main
     ↓
  CI (lint)
     ↓
  Build
     ↓
  Deploy
```

---

## CI (`ci.yml`)

Triggered on push to `main` or pull requests affecting `frontend/**` or `backend/**`.

Runs ESLint on both services sequentially — the frontend lint only runs if the backend lint passes.

```
lint-backend → lint-frontend
```

---

## Build (`build.yml`)

Triggered after the CI workflow completes successfully.

- Installs backend dependencies
- Builds the Next.js frontend, generating static files in the `out/` directory

---

## Deploy (`deploy.yml`)

Triggered after the Build workflow completes successfully.

Performs the full deployment to AWS:

- **Backend**: builds the Docker image, pushes it to **ECR**, and forces a new deployment on **ECS Fargate**
- **Frontend**: builds the Next.js static output and syncs it to an **S3 bucket**

All sensitive values (AWS credentials, ECR URL, S3 bucket, ECS cluster and service names) are stored as **GitHub repository secrets**.

---

# How to Run

Build and start all containers:

```
docker compose up --build
```

The application will be available at:

```
http://localhost
```

API tests:

```bash
curl http://localhost/api/health
curl http://localhost/api/db-time
curl http://localhost/api/tasks
```

Simulate a 500 error (for alert testing):

```bash
for i in {1..30}; do curl http://localhost/api/fail; done
```

Simulate a service outage (for ServiceDown alert):

```bash
docker compose stop backend
# wait ~30s for the alert to fire in Discord
docker compose start backend
# wait ~30s for the resolved notification
```

Observability dashboards:

```
http://localhost:3000   → Grafana
http://localhost:9090   → Prometheus
http://localhost:9093   → Alertmanager
```

---

# Concepts Practiced

- Creating **Dockerfiles**
- **Multi-stage builds**
- Building **custom images**
- **Docker Compose** for orchestration
- Inter-container communication via **internal Docker network**
- **Reverse proxy with Nginx**
- **Volumes** for data persistence
- **Healthchecks**
- Service separation into **frontend, backend, and database**
- **CI/CD pipelines** with GitHub Actions
- Docker image publishing to **Amazon ECR**
- Automated deployment to **Amazon ECS Fargate**
- Static file hosting on **Amazon S3**
- **Metrics instrumentation** with `prom-client`
- **Metrics collection** with Prometheus
- **Visualization** with Grafana
- **Alerting** with Alertmanager
- **Incident notification** via Discord webhook
- **SLI/SLO** concepts in practice
- Full **observability cycle**: detection → alert → resolution → resolved notification

---

# Conclusion

This project demonstrates how to containerize a modern web application and orchestrate multiple services using Docker Compose, while also automating the full delivery lifecycle through a CI/CD pipeline.

The architecture simulates a common production scenario, including service separation, reverse proxy, inter-container communication, automated deployments to AWS, and a complete observability stack with metrics, dashboards, and real-time alerting.
