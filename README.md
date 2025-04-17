LIMS Project
A modern, API-first Laboratory Information Management System (LIMS) for managing lab samples, workflows, and data. Built with FastAPI, React, SQLAlchemy/SQLModel, PostgreSQL, and MongoDB, deployed using Docker for scalability and portability.
Table of Contents

Features
Tech Stack
Prerequisites
Installation
Running the Application
API Documentation
Directory Structure
Testing
Deployment
Contributing
License

Features

REST API: Manage lab samples, workflows, and reports via a high-performance FastAPI backend.
Dynamic Frontend: React-based dashboard for sample tracking and analytics.
Structured Data: PostgreSQL with SQLAlchemy/SQLModel for samples, users, and audit trails.
Unstructured Data: MongoDB for experiment notes and raw instrument outputs.
Compliance: Supports FDA 21 CFR Part 11 with audit logging and secure authentication.
Scalable Deployment: Dockerized services, ready for AWS ECS or Kubernetes.
Security: OAuth2 with JWT, HTTPS, and role-based access control (RBAC).

Tech Stack

Backend: FastAPI (Python 3.11)
Frontend: React (TypeScript, Vite)
Databases:
PostgreSQL (structured data, audit trails)
MongoDB (unstructured data, experiment notes)


ORM: SQLAlchemy with SQLModel (PostgreSQL), Motor (MongoDB)
Deployment: Docker, NGINX
Future Scalability: AWS ECS or Kubernetes
Tools: Alembic (migrations), pytest (testing), Tailwind CSS (styling)

Prerequisites

Docker and Docker Compose (for containerized deployment)
Python 3.11 (for local backend development)
Node.js 20 (for local frontend development)
Git (for version control)
PostgreSQL and MongoDB (if running without Docker)

Installation

Clone the Repository:
git clone https://github.com/your-username/lims-project.git
cd lims-project


Set Up Environment:

Copy .env.example to .env and configure variables:
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/lims
MONGO_URL=mongodb://mongo:27017/lims
JWT_SECRET=your-secret-key


Ensure .env is not committed to Git.



Install Backend Dependencies:
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

Dependencies include fastapi==0.115.12, sqlalchemy[asyncio]==2.0.40, pymongo==4.12.0, and motor==3.7.0.

Install Frontend Dependencies:
cd frontend
npm install


Set Up Databases (if not using Docker):

PostgreSQL: Create a database named lims and update DATABASE_URL.
MongoDB: Ensure MongoDB is running on localhost:27017.



Running the Application
With Docker (Recommended)

Build and start services:
docker-compose up --build


Access the application:

API: http://localhost:8000
Frontend: http://localhost:3000
API Docs: http://localhost:8000/docs


Stop services:
docker-compose down



Without Docker

Backend:
cd backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload


Frontend:
cd frontend
npm run dev


Databases:

Ensure PostgreSQL and MongoDB are running locally.

Run migrations for PostgreSQL:
cd backend
alembic upgrade head





API Documentation

Swagger UI: Available at http://localhost:8000/docs when the backend is running.
Sample Endpoints:
POST /samples: Create a new sample (PostgreSQL).
GET /samples/{sample_id}: Retrieve sample details.
GET /workflows: List active workflows.
POST /experiments: Store experiment data (MongoDB).


Authentication: Use OAuth2 with JWT tokens (configure via /auth/token).

Directory Structure
/lims-project
├── /backend
│   ├── /app
│   │   ├── /models         # SQLModel definitions (e.g., Sample, Workflow)
│   │   ├── /routers        # FastAPI route handlers
│   │   ├── /schemas        # Pydantic schemas for API validation
│   │   ├── /utils          # Authentication, logging utilities
│   │   └── main.py         # FastAPI app entry point
│   ├── /migrations         # Alembic migration scripts
│   ├── Dockerfile          # Backend Docker configuration
│   └── requirements.txt    # Python dependencies
├── /frontend
│   ├── /src
│   │   ├── /components     # React components (e.g., SampleTable)
│   │   ├── /pages          # React routes
│   │   ├── /api            # API client (Axios)
│   │   └── App.tsx         # Main React app
│   ├── Dockerfile          # Frontend Docker configuration
│   └── package.json        # Node dependencies
├── /docker-compose.yml     # Docker Compose configuration
├── /nginx
│   └── nginx.conf          # NGINX configuration
├── .env.example            # Environment variable template
└── README.md               # Project documentation

Testing

Backend:
cd backend
pytest


Uses pytest==8.3.3 and pytest-asyncio==0.24.0 for API and database tests.


Frontend:
cd frontend
npm test


Uses Jest and React Testing Library.


Manual Testing: Use Postman or curl to test API endpoints.


Deployment

Local: Use docker-compose for development and testing.
Production:
Build Docker images and push to a registry (e.g., Docker Hub, AWS ECR):
docker-compose build
docker-compose push


Deploy to a cloud provider:

AWS ECS: Use Fargate for serverless containers.
Kubernetes: Deploy with Helm charts or kompose.




HTTPS: Configure NGINX with Let’s Encrypt or AWS Certificate Manager.
Monitoring: Add Prometheus/Grafana or AWS CloudWatch for metrics and logs.

Contributing

Fork the repository.
Create a feature branch (git checkout -b feature/your-feature).
Commit changes (git commit -m "Add your feature").
Push to the branch (git push origin feature/your-feature).
Open a pull request.


Code Style:
Backend: Use black, flake8, isort.
Frontend: Use ESLint, Prettier.


Issues: Report bugs or suggest features via GitHub Issues.

License
This project is licensed under the MIT License. See LICENSE for details.
