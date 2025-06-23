# FocusWord CMS (Backend)

**FocusWord Backend** is a modern open-source CMS server inspired by WordPress, built with NestJS, TypeScript, and Docker. The project provides API, authentication, media, users, categories, and is fully ready for containerized deployment.

---

## Features

- **NestJS + TypeScript**: Modern, scalable backend.
- **Docker & Docker Compose**: Fast launch and deployment.
- **PostgreSQL**: Reliable database.
- **Redis**: Caching and queues.
- **Swagger**: Auto-generated API documentation.
- **Modular architecture**: Easy to extend and maintain.
- **Testing**: Unit and e2e with Jest.

---

## Quick Start (Docker)

### 1. Clone the repository
```bash
git clone https://github.com/your-org/focusword-backend.git
cd focusword-backend
```

### 2. Create .env files (or use provided ones)
- `.production.env` — for production
- `.development.env` — for local development

### 3. Start with Docker Compose
```bash 
  docker-compose up --build
```

This will start:
- **main** — API server (NestJS) on port 5000
- **postgres** — PostgreSQL on port 5432
- **redis** — Redis on port 6379
- **pgadmin** — PgAdmin on port 8080

> All environment variables for services are taken from `.production.env` and `.development.env` (see docker-compose.yml).

### 4. Swagger documentation
- [http://localhost:5000/api](http://localhost:5000/api)

### 5. Stop containers
```bash
  docker-compose down
```

---

## Local Development (without Docker)

```bash
  npm install
  npm run start:dev
```
> You need to have local PostgreSQL and Redis running, configure environment variables in `.development.env`.

---

## Scripts

- `npm run start:dev` — start in development mode (watch mode)
- `npm run start` — start in production
- `npm run build` — build the project
- `npm run test` — unit tests
- `npm run test:e2e` — e2e tests
- `npm run test:cov` — test coverage

---

## Project Structure

```
├── src/                # NestJS source code
├── test/               # Tests
├── Dockerfile
├── docker-compose.yml
├── .production.env
├── .development.env
├── package.json
└── ...
```

---

## Technologies

- **NestJS**
- **TypeScript**
- **PostgreSQL**
- **Redis**
- **Docker, Docker Compose**
- **Jest**

---

## License

MIT (or your license)
