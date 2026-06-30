# Enterprise Operations Dashboard

<div align="center">

# Enterprise Operations Dashboard

**Professional Enterprise Monitoring, Operations and Analytics Platform**

Plataforma corporativa para monitoramento operacional, análise executiva, telemetria, gestão de usuários e indicadores estratégicos em tempo real.







\

</div>

---

## Overview

Enterprise Operations Dashboard é uma plataforma corporativa moderna desenvolvida para centralizar monitoramento operacional, gestão de usuários, telemetria, alertas e indicadores estratégicos em uma única interface.

O sistema foi projetado seguindo princípios de escalabilidade, modularidade e segurança, permitindo expansão futura para ambientes empresariais de médio e grande porte.

---

## Key Features

### Authentication & Security

* JWT Authentication
* Access Token + Refresh Token
* Protected Routes
* AuthGuard
* Secure Logout
* Role-Based Access Control (RBAC)

### Dashboard

* Executive KPI Dashboard
* Interactive Charts
* Real-Time Metrics
* Recent Activity Feed
* Corporate Dark Theme

### Administration

* User Management (CRUD)
* Roles Management (CRUD)
* Alerts Management (CRUD)
* Telemetry Management (CRUD)

### Monitoring

* Operational Metrics
* Event Tracking
* Alerts Center
* Telemetry Visualization
* Activity Timeline

---

## Technology Stack

### Frontend

* Next.js
* React
* TypeScript
* Recharts
* Tailwind CSS

### Backend

* FastAPI
* Python
* JWT Authentication

### Database

* PostgreSQL

### DevOps & Infrastructure

* Docker
* GitHub Actions
* AWS

---

## Project Architecture

```text
Client
   │
   ▼
Next.js Frontend
   │
JWT Authentication
   │
   ▼
FastAPI Backend
   │
   ▼
PostgreSQL Database
```

---

## Repository Structure

```text
.
├── apps/
│   ├── web/           # Frontend Next.js
│   └── api/           # Backend FastAPI
│
├── database/          # Migrations and seeds
├── docs/              # Architecture and documentation
├── infra/             # Infrastructure resources
├── packages/          # Shared code
│
└── README.md
```

---

## Current Modules

| Module             | Status |
| ------------------ | ------ |
| Authentication     | ✅      |
| Dashboard          | ✅      |
| Users CRUD         | ✅      |
| Roles CRUD         | ✅      |
| Alerts CRUD        | ✅      |
| Telemetry CRUD     | ✅      |
| Activity Feed      | ✅      |
| Enterprise Sidebar | 🚧     |
| Reports            | 🚧     |
| Audit Logs         | 🚧     |

---

## Local Development

### Clone repository

```bash
git clone https://github.com/tonymagno/Enterprise-Operations-Dashboard.git
cd Enterprise-Operations-Dashboard
```

### Frontend

```bash
cd apps/web

npm install

npm run dev
```

### Backend

```bash
cd apps/api

pip install -r requirements.txt

uvicorn main:app --reload
```

---

## Environment Variables

Example:

```env
DATABASE_URL=
SECRET_KEY=
ACCESS_TOKEN_EXPIRE_MINUTES=
REFRESH_TOKEN_EXPIRE_DAYS=
```

---

## Security

This project implements:

* JWT Authentication
* Refresh Tokens
* Protected Routes
* Role-based authorization
* Secure API communication

---

## Roadmap

### Sprint 1 — Foundation

* [x] Authentication
* [x] Dashboard
* [x] CRUD Base Structure

### Sprint 2 — Enterprise UI

* [ ] Premium Sidebar
* [ ] Responsive Navigation
* [ ] Dashboard Refinements

### Sprint 3 — Monitoring

* [ ] Audit Logs
* [ ] Notifications Center
* [ ] Reports Module

### Sprint 4 — Production

* [ ] CI/CD Pipeline
* [ ] Docker Deployment
* [ ] AWS Infrastructure

---

## Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feature/my-feature
```

3. Commit your changes.

```bash
git commit -m "feat: add new feature"
```

4. Push to your branch.

```bash
git push origin feature/my-feature
```

5. Open a Pull Request.

---

## Author

**Tony Magno**

* GitHub: https://github.com/tonymagno
* LinkedIn: [www.linkedin.com/in/tonymagno](http://www.linkedin.com/in/tonymagno)

---

## License

Distributed under the MIT License.
