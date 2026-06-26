# System Architecture

## Overview
The Enterprise Operations Dashboard is a monorepo with two main applications:
- `apps/web`: Next.js frontend
- `apps/api`: FastAPI backend

## Core Flow
1. User interacts with the dashboard.
2. Frontend calls the backend API.
3. Backend reads/writes data in PostgreSQL.
4. Telemetry and alerts are exposed in real time or near real time.

## Modules
- Authentication and authorization
- KPI dashboard
- Telemetry ingestion
- Alerts engine
- Reports export
- Audit logs

## Infrastructure
- Docker for local development
- GitHub Actions for CI/CD
- AWS for future deployment and scaling
