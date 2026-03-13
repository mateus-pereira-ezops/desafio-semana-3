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
Frontend (Next.js)
   ↓
Backend (Express API)
   ↓
PostgreSQL
```

- **Nginx**: acts as a reverse proxy and the application's entry point.
- **Frontend**: Next.js application responsible for the web interface.
- **Backend**: Express API responsible for accessing the database.
- **Database**: PostgreSQL running in a separate container.

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
├── frontend
│   ├── Dockerfile
│   ├── package.json
│   └── app/
├── backend
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       └── index.js
└── .env
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

A simple API built with **Express**, responsible for connecting to the PostgreSQL database.

Implemented endpoints:

```
GET /health
GET /db-time
```

Example healthcheck endpoint:

```javascript
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});
```

---

## Database

**PostgreSQL** database running in a container using the official image:

```
postgres:16-alpine
```

Data persistence is ensured through a **Docker volume**.

---

# Docker Compose

The `docker-compose.yml` defines four services:

- `nginx`
- `frontend`
- `backend`
- `db`

Key features used:

- **custom image builds**
- **internal Docker network**
- **reverse proxy**
- **environment variables**
- **healthchecks**
- **volumes for persistence**

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

```
curl http://localhost/api/health
curl http://localhost/api/db-time
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

---

# Conclusion

This project demonstrates how to containerize a modern web application and orchestrate multiple services using Docker Compose, while also automating the full delivery lifecycle through a CI/CD pipeline.

The architecture simulates a common production scenario, including service separation, reverse proxy, inter-container communication, and automated deployments to AWS using GitHub Actions.
