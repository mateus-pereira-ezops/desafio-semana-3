# Simple Web App – Docker + Docker Compose

## Objetivo

O objetivo deste projeto é:

- Containerizar uma aplicação web simples usando Docker

- Orquestrar a aplicação e um banco de dados utilizando Docker Compose

- Garantir isolamento, portabilidade e facilidade de execução do ambiente

Este projeto demonstra conceitos fundamentais de:

- Criação de imagens Docker

- Boas práticas em Dockerfile

- Comunicação entre containers

- Gerenciamento de variáveis de ambiente

- Orquestração multi-container

## Arquitetura

Usuário → Web App (Container)
                ↓
           Database (Container)

A aplicação web se conecta ao banco de dados através da rede interna criada automaticamente pelo Docker Compose.

## Estrutura do Projeto
.
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── package.json
├── src/
│   └── index.js
└── README.md

## Dockerfile

Responsável por:

- Utilizar uma imagem base oficial (Node Alpine)

- Definir diretório de trabalho

- Copiar arquivos

- Instalar dependências

- Definir comando de inicialização

Exemplo:

```bash
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "src/index.js"]
```

## Docker Compose

O docker-compose.yml sobe dois serviços:

app → aplicação web

db → banco de dados (ex: PostgreSQL ou MySQL)

Exemplo com PostgreSQL:

```bash
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DB_HOST: db
      DB_USER: postgres
      DB_PASSWORD: postgres
      DB_NAME: appdb
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: appdb
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:
```

## Como Executar

1️⃣ Build e subir os containers
```
docker compose up --build
```

2️⃣ Rodar em background
```
docker compose up -d --build
```

3️⃣ Parar os containers
```
docker compose down
```

4️⃣ Remover volumes também
```
docker compose down -v
```

## Acesso

Aplicação disponível em:

http://localhost:3000

## Comunicação Entre Containers

O serviço app se conecta ao banco usando:

```env
DB_HOST=db
```

O nome do serviço no docker-compose.yml funciona como hostname dentro da rede Docker.

## Variáveis de Ambiente

As variáveis são definidas no docker-compose.yml e injetadas no container.

Boa prática para produção:

- Utilizar .env

- Não versionar credenciais reais

- Usar secrets em ambientes reais

## Conceitos Demonstrados

- Containerização de aplicações

- Multi-stage build (opcional)

- Orquestração com Docker Compose

- Persistência de dados com volumes

- Rede interna automática

- Isolamento de ambiente

## Possíveis Melhorias

- Implementar CI/CD para build automático

- Implementar migrations automáticas

- Usar multi-stage build para reduzir tamanho da imagem

- Adicionar Nginx como reverse proxy

## Conclusão

Este projeto demonstra como:

1. Empacotar uma aplicação web

2. Integrar com banco de dados em ambiente isolado

3. Reproduzir facilmente o ambiente em qualquer máquina
