# CodeQuest — Frontend

## Overview

This is the frontend for CodeQuest.

we use it to:

* browse problems
* write and submit code
* view results in real time
* track progress

Built with Next.js.

---

## Related Repositories

CodeQuest uses a multi-repo architecture.

### Backend API

Handles:

* authentication
* problems
* submissions
* users

👉 [https://github.com/sriteja-28/codequest-backend.git](https://github.com/sriteja-28/codequest-backend.git)

---

### Judge Service

Handles:

* code execution
* sandboxing with Docker
* test case evaluation

👉 [https://github.com/sriteja-28/codequest-judge.git](https://github.com/sriteja-28/codequest-judge.git)

---

### Infrastructure (IMPORTANT)

Handles core services:

* PostgreSQL
* Redis
* RabbitMQ

👉 [https://github.com/sriteja-28/codequest-infra.git](https://github.com/sriteja-28/codequest-infra.git)

You must start this before running backend or judge.

---

### Documentation

Full system design and setup:

👉 [https://github.com/sriteja-28/codequest-docs.git](https://github.com/sriteja-28/codequest-docs.git)

---

## Architecture (High Level)

frontend → backend → rabbitmq → judge → backend → frontend

redis handles real-time updates via websockets

---

## Prerequisites

* Node.js 20+
* backend running
* infra running (redis + rabbitmq + postgres)

---

## Setup

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

---

## Required Services

start infra first:

```bash
cd infra
docker compose up -d
```

this starts:

* postgres
* redis
* rabbitmq

---

## Development Flow

* open problem
* write code
* click submit
* request goes to backend
* backend pushes job to rabbitmq
* judge picks job and runs code
* result sent back via websocket (redis)

---

## Features

* problem list
* code editor
* real-time submission status
* multi-language support
* contest UI

---

## Future Work

* AI hints UI
* discussion system
* performance analytics

---

## Notes

* backend must be running on port 8000
* infra must be running before submissions work
* judge must be active for execution

---

## License

MIT
