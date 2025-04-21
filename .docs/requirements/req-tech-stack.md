LIMS Tech Stack Requirements
1. Overview
This document outlines the technical requirements for a modern, API-first Laboratory Information Management System (LIMS) designed for scalability, flexibility, and compliance with lab standards. The system will support sample tracking, workflow management, and reporting, with a modular architecture to accommodate future growth.
2. Tech Stack
2.1 Backend

Framework: FastAPI (Python)
Purpose: Build a high-performance, async-capable REST API for lab operations.
Version: Latest stable (e.g., 0.115.0 as of April 2025).
Features:
Async/await for concurrent API requests (e.g., real-time instrument data).
Automatic OpenAPI (Swagger) documentation for API testing.
Pydantic for data validation of lab entities (e.g., samples, assays).


Dependencies:
fastapi: Core framework.
uvicorn: ASGI server for production.
python-jose[cryptography]: For JWT-based authentication.
passlib[bcrypt]: For password hashing.
python-multipart: For file uploads (e.g., lab reports).





2.2 Frontend

Framework: React (JavaScript/TypeScript)
Purpose: Create a dynamic, responsive dashboard for lab users to interact with the LIMS (e.g., sample tracking, analytics).
Version: Latest stable (e.g., 18.x as of April 2025).
Features:
Component-based architecture for reusable UI elements (e.g., sample tables, workflow forms).
State management with Redux Toolkit or Zustand.
API integration with Axios or Fetch for REST endpoints.
Responsive design for desktop and tablet use in labs.


Dependencies:
react, react-dom: Core libraries.
react-router-dom: For client-side routing.
axios: For API requests.
tailwindcss: For modern, utility-first styling.
material-ui or antd: For lab-friendly UI components (tables, charts).
vite: For fast development and bundling.





2.3 Database (Relational)

Database: PostgreSQL
Purpose: Store structured lab data (samples, workflows, users, audit trails).
Version: Latest stable (e.g., 16.x as of April 2025).
Features:
JSONB fields for flexible metadata (e.g., sample attributes).
Full-text search for querying lab notes.
Triggers and stored procedures for audit logging.
Support for ACID transactions for data integrity.


Configuration:
Use asyncpg as the async driver for FastAPI integration.
Enable extensions: uuid-ossp (for UUIDs), pg_trgm (for search).
Set up indexes for frequent queries (e.g., sample_id, status).





2.4 Database (NoSQL)

Database: MongoDB
Purpose: Store unstructured or semi-structured data (e.g., experiment notes, raw instrument outputs).
Version: Latest stable (e.g., 7.x as of April 2025).
Features:
Schema-less design for flexible lab data.
Aggregation pipelines for analytics (e.g., summarizing experiment results).
High write throughput for logging instrument data.


Configuration:
Use motor as the async MongoDB driver for FastAPI.
Set up indexes for common queries (e.g., experiment_id).
Enable replica sets for high availability (optional).





2.5 ORM

Library: SQLAlchemy with SQLModel
Purpose: Manage database interactions for PostgreSQL with a Pydantic-friendly interface.
Version: SQLAlchemy 2.x, SQLModel latest (e.g., 0.0.18 as of April 2025).
Features:
SQLModel for defining models with Pydantic validation and SQLAlchemy ORM.
Async support via sqlalchemy[asyncio] and asyncpg.
Alembic for database migrations.
Event listeners for audit logging (e.g., tracking sample updates).


Dependencies:
sqlalchemy[asyncio]: Core ORM with async support.
sqlmodel: Pydantic-SQLAlchemy integration.
alembic: For migrations.
databases: For lightweight async queries.





2.6 Authentication & Security

Mechanism: OAuth2 with JWT
Purpose: Secure API endpoints and user access (e.g., lab managers, technicians).
Implementation:
Use python-jose for JWT generation/validation.
Store hashed passwords in PostgreSQL using passlib[bcrypt].
Role-based access control (RBAC) for lab roles (e.g., admin, user).


Features:
Token-based authentication for API requests.
Refresh tokens for session management.
HTTPS enforcement for all API traffic.
Audit logging for user actions (stored in PostgreSQL).





3. REST API Requirements

Architecture: RESTful API with JSON payloads.
Endpoints (Sample):
GET /samples/{sample_id}: Retrieve sample details.
POST /samples: Create a new sample.
PUT /samples/{sample_id}: Update sample status or metadata.
GET /workflows: List active lab workflows.
POST /reports: Generate lab reports (stored in MongoDB).
GET /audit-logs: Retrieve audit trail for compliance.


Standards:
Follow REST conventions (HTTP methods, status codes).
Use OpenAPI 3.0 for documentation.
Implement HATEOAS (optional) for discoverable APIs.


Error Handling:
Return JSON error responses with detail and status_code.
Handle validation errors via Pydantic.


Pagination:
Use offset/limit for large datasets (e.g., sample lists).
Implement cursor-based pagination for MongoDB queries.


Versioning:
Use URL versioning (e.g., /v1/samples) for API evolution.



4. Deployment

Platform: Docker

Purpose: Containerize services for portability and consistency.
Components:
FastAPI backend (Python container).
React frontend (Node.js container).
PostgreSQL database (official image).
MongoDB database (official image).
NGINX (reverse proxy for API and frontend).


Configuration:
Use docker-compose for local development and testing.
Define multi-stage Dockerfiles for optimized builds.
Set environment variables for secrets (e.g., database credentials).


Networking:
Create a Docker network for inter-container communication.
Expose only NGINX to the public (port 80/443).


Storage:
Use Docker volumes for PostgreSQL and MongoDB data persistence.
Back up volumes regularly for disaster recovery.




Future Scalability:

AWS ECS: Can be added later for managed container orchestration.
Use ECS Fargate for serverless scaling.
Integrate with AWS RDS (PostgreSQL) and DocumentDB (MongoDB-compatible).


Kubernetes: Can be added later for advanced orchestration.
Use Helm charts for LIMS deployment.
Leverage Kubernetes for auto-scaling, load balancing, and high availability.
Migrate Docker Compose to Kubernetes manifests with tools like kompose.





5. Development Tools

Version Control: Git (GitHub for hosting, e.g., extending LIMSbase).
IDE: VS Code or PyCharm for Python/React development.
Testing:
Backend: pytest with pytest-asyncio for FastAPI and SQLAlchemy.
Frontend: Jest and React Testing Library.
API: Postman or httpie for manual testing.


Linting/Formatting:
Backend: black, flake8, isort.
Frontend: ESLint, Prettier.


CI/CD (Optional):
GitHub Actions for automated testing and deployment.
Build Docker images on commit and push to Docker Hub or AWS ECR.



6. Compliance & Security

Lab Standards:
Support FDA 21 CFR Part 11 (electronic records) with audit trails in PostgreSQL.
Ensure HIPAA/GDPR compliance for sensitive lab data.


Security Practices:
Use HTTPS with Let’s Encrypt or AWS Certificate Manager.
Sanitize inputs to prevent SQL injection (handled by SQLAlchemy).
Implement rate limiting on API endpoints (via slowapi).
Regular security audits and dependency scanning (e.g., safety, dependabot).


Backup:
Daily backups of PostgreSQL and MongoDB.
Store backups in AWS S3 or equivalent.



7. Performance

Backend:
Optimize FastAPI with async endpoints and connection pooling (asyncpg).
Cache frequent queries (e.g., sample lists) with Redis (optional).


Database:
Index PostgreSQL tables for common queries (e.g., sample_id, status).
Use MongoDB indexes for experiment data retrieval.


Frontend:
Lazy-load React components for large datasets.
Optimize bundle size with Vite code splitting.



8. Scalability

Horizontal Scaling:
Run multiple FastAPI containers behind NGINX load balancer.
Scale PostgreSQL with read replicas (AWS RDS).
Use MongoDB replica sets for high availability.


Future Orchestration:
Transition to AWS ECS or Kubernetes for auto-scaling.
Use AWS Application Load Balancer or Kubernetes Ingress for traffic management.



9. Sample Directory Structure
/lims-project
├── /backend
│   ├── /app
│   │   ├── /models         # SQLModel definitions
│   │   ├── /routers        # FastAPI route handlers
│   │   ├── /schemas        # Pydantic schemas
│   │   ├── /utils          # Authentication, logging
│   │   └── main.py         # FastAPI app entry point
│   ├── /migrations         # Alembic migration scripts
│   ├── Dockerfile          # Backend Docker config
│   └── requirements.txt    # Python dependencies
├── /frontend
│   ├── /src
│   │   ├── /components     # React components
│   │   ├── /pages          # React routes
│   │   │   ├── /auth       # React routes
│   │   │   └── /dashboard  # React routes
│   │   ├── /api            # API client (Axios)
│   │   ├── /utils          # React utilities
│   │   └── App.tsx         # Main React app
│   ├── Dockerfile          # Frontend Docker config
│   └── package.json        # Node dependencies
├── /docker-compose.yml     # Docker Compose configuration
├── /nginx
│   └── nginx.conf          # NGINX configuration
└── README.md               # Project documentation

10. Dependencies (Sample)
Backend (requirements.txt):
fastapi==0.115.0
uvicorn==0.32.0
sqlalchemy[asyncio]==2.0.35
sqlmodel==0.0.18
asyncpg==0.30.0
databases==0.9.0
alembic==1.13.3
pymongo==4.10.1
motor==3.6.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.12
slowapi==0.1.9
pytest==8.3.3
pytest-asyncio==0.24.0

Frontend (package.json):
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.27.0",
    "axios": "^1.7.7",
    "tailwindcss": "^3.4.14",
    "@mui/material": "^6.1.3",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "vite": "^5.4.8",
    "eslint": "^9.12.0",
    "prettier": "^3.3.3",
    "@testing-library/react": "^16.0.1",
    "jest": "^29.7.0"
  }
}

11. Deployment with Docker
docker-compose.yml (Sample):
version: '3.8'
services:
  backend:
    build: ./backend
    environment:
      - DATABASE_URL=postgresql+asyncpg://user:pass@postgres:5432/lims
      - MONGO_URL=mongodb://mongo:27017/lims
    depends_on:
      - postgres
      - mongo
    networks:
      - lims-network
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    networks:
      - lims-network
  postgres:
    image: postgres:16
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=lims
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - lims-network
  mongo:
    image: mongo:7
    volumes:
      - mongo-data:/data/db
    networks:
      - lims-network
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - backend
      - frontend
    networks:
      - lims-network
volumes:
  postgres-data:
  mongo-data:
networks:
  lims-network:
    driver: bridge

Dockerfile (Backend):
FROM python:3.11-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

Dockerfile (Frontend):
FROM node:22-alpine
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install
COPY frontend/ .
RUN npm run build
CMD ["npm", "run", "preview"]

12. Future Considerations

Orchestration: Migrate to AWS ECS or Kubernetes for production scaling.
ECS: Use Fargate for serverless containers; integrate with AWS ALB.
Kubernetes: Deploy with Helm; use Ingress for routing.


Monitoring:
Add Prometheus and Grafana for API and database metrics.
Use AWS CloudWatch or ELK Stack for logs.


CI/CD:
Automate Docker builds with GitHub Actions.
Deploy to AWS ECS or Kubernetes via pipelines.



13. Next Steps

Initialize project with Git repository.
Set up local development with docker-compose up.
Define initial SQLModel schemas for core entities (e.g., Sample, Workflow).
Implement sample REST endpoints (/samples).
Develop React dashboard with sample tracking UI.
Configure Alembic for PostgreSQL migrations.
Test API with Postman and frontend integration.

