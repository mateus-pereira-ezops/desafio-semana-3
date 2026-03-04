# Semana 3 – Containers (Docker + Docker Compose + Nginx)

## Objetivo

Containerizar uma aplicação web e orquestrar múltiplos serviços utilizando **Docker** e **Docker Compose**, simulando uma arquitetura mais próxima de ambientes reais utilizados em clientes.

A aplicação foi dividida em **frontend**, **backend**, **banco de dados** e **reverse proxy**, permitindo demonstrar comunicação entre serviços dentro de uma rede Docker.

---

# Arquitetura

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

* **Nginx**: atua como reverse proxy e ponto de entrada da aplicação.
* **Frontend**: aplicação Next.js responsável pela interface web.
* **Backend**: API construída com Express responsável por acessar o banco.
* **Database**: PostgreSQL executando em container separado.

Todos os serviços se comunicam através de uma **rede interna Docker**.

---

# Estrutura do Projeto

```
.
├── docker-compose.yml
├── nginx
│   └── default.conf
│
├── frontend
│   ├── Dockerfile
│   ├── package.json
│   └── app/
│
├── backend
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       └── index.js
│
└── .env
```

---

# Serviços

## Nginx (Reverse Proxy)

O Nginx atua como **gateway da aplicação**, encaminhando requisições para os serviços internos.

Regras de roteamento:

* `/` → **Frontend (Next.js)**
* `/api/*` → **Backend (Express)**

Isso permite expor **apenas um serviço público**, mantendo backend e banco isolados dentro da rede Docker.

---

## Frontend

Aplicação construída com **Next.js**, responsável por renderizar a interface web e consumir a API.

O container utiliza **multi-stage build** para simular um ambiente mais próximo de produção.

### Dockerfile (resumo)

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

API simples construída com **Express**, responsável por conectar ao banco PostgreSQL.

Endpoints implementados:

```
GET /health
GET /db-time
```

Exemplo de endpoint de healthcheck:

```javascript
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});
```

---

## Database

Banco de dados **PostgreSQL** rodando em container utilizando a imagem oficial:

```
postgres:16-alpine
```

Persistência de dados é garantida através de um **volume Docker**.

---

# Docker Compose

O `docker-compose.yml` define quatro serviços:

* `nginx`
* `frontend`
* `backend`
* `db`

Principais recursos utilizados:

* build de **imagens customizadas**
* **rede interna Docker**
* **reverse proxy**
* **variáveis de ambiente**
* **healthcheck**
* **volumes para persistência**

---

# Como Executar

Build e inicialização dos containers:

```
docker compose up --build
```

A aplicação ficará disponível em:

```
http://localhost
```

Testes de API:

```
curl http://localhost/api/health
curl http://localhost/api/db-time
```

---

# Conceitos Praticados

Durante o desafio foram praticados os seguintes conceitos:

* criação de **Dockerfiles**
* **multi-stage builds**
* construção de **imagens customizadas**
* **Docker Compose** para orquestração
* comunicação entre containers via **rede interna**
* **reverse proxy com Nginx**
* **volumes** para persistência de dados
* **healthchecks**
* separação de serviços em **frontend, backend e database**

---

# Conclusão

Este projeto demonstra como containerizar uma aplicação web moderna e organizar múltiplos serviços utilizando Docker Compose.

A arquitetura utilizada simula um cenário comum em ambientes de produção, incluindo separação de serviços, uso de reverse proxy e comunicação entre containers dentro de uma rede interna.
