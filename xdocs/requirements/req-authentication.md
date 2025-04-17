### Authentication and Authorization Requirements

#### 1. Compliance Scope
- **Standards**: The system must comply with **FDA 21 CFR Part 11** and **HIPAA** for:
  - **Audit Trails**: Log all user actions (e.g., signup, login, permission changes) in PostgreSQL to ensure traceability.
  - **Data Encryption**: Encrypt sensitive data (e.g., passwords, user data) at rest in PostgreSQL and MongoDB, and in transit via HTTPS through NGINX.
  - **Session Management**: Secure session handling with JWTs, refresh tokens, and session revocation to protect user access.
- **Audit Logging**:
  - All authentication and authorization events (e.g., signup, login, approval, role/group changes, failed login attempts) must be logged in a PostgreSQL `audit_log` table with fields: `user_id`, `action`, `details`, `timestamp`.
  - Logs must be immutable (no updates/deletes) and accessible to admins for compliance audits.
- **Data Encryption**:
  - Passwords must be hashed using a secure algorithm (e.g., bcrypt).
  - API traffic must use HTTPS, enforced by NGINX.
  - Sensitive data in PostgreSQL (e.g., user details) and MongoDB (e.g., experiment notes) must be encrypted or access-controlled.
- **Session Management**:
  - Sessions must use short-lived JWTs (e.g., 30-minute expiry) with refresh tokens (e.g., 7-day expiry).
  - Admins must be able to revoke user sessions via an API endpoint.

#### 2. User Signup
- **Functionality**:
  - Users can sign up via a REST API endpoint (`POST /auth/signup`) with fields: `email`, `password`, `first_name`, `last_name`.
  - Email verification is required before the account is created; users receive a verification link via email.
  - After verification, accounts are created with a “Pending” status and no permissions until approved by an admin.
  - Admins are notified of pending approvals via an in-app notification (no email).
- **API Endpoint**:
  - `POST /auth/signup`: Initiates signup with email, password, first name, last name.
    - Response (200): `{ "message": "Verification email sent" }`
    - Response (400): `{ "detail": "Email already exists" }`
  - `GET /auth/verify?token=string`: Verifies email and creates the account.
    - Response (200): `{ "message": "Account created, awaiting admin approval" }`
    - Response (400): `{ "detail": "Invalid or expired token" }`
- **Constraints**:
  - Email must be unique and valid.
  - Password must meet complexity requirements (e.g., 8+ characters, letters, numbers).
  - Accounts remain inactive (`is_active=false`) until admin approval.
  - No time limit for unapproved accounts (no auto-deletion).
- **Admin Approval**:
  - Admins approve users via a REST endpoint (e.g., `PATCH /auth/users/{user_id}/approve`).
  - Approval assigns roles (default: “Read-Only”) and groups (default: none or admin-specified).
  - In-app notifications alert admins of pending approvals, visible in an admin dashboard.

#### 3. User Login
- **Functionality**:
  - Users log in via a REST API endpoint (`POST /auth/token`) using OAuth2 password flow with fields: `email`, `password`, `role` (selected from a dropdown based on user’s email).
  - Successful login returns a JWT containing user ID, roles, and group IDs, plus a refresh token.
  - Only approved users (`is_active=true`) can log in.
  - A “Forgot Password” feature allows users to request a password reset link via email.
- **API Endpoints**:
  - `POST /auth/token`:
    - Request: `grant_type=password&email=string&password=string&role=string`
    - Response (200): `{ "access_token": "string", "token_type": "bearer", "refresh_token": "string" }`
    - Response (401): `{ "detail": "Invalid credentials, account not approved, or role mismatch" }`
  - `POST /auth/forgot-password`:
    - Request: `{ "email": "string" }`
    - Response (200): `{ "message": "Password reset link sent" }`
  - `POST /auth/reset-password?token=string`:
    - Request: `{ "new_password": "string" }`
    - Response (200): `{ "message": "Password reset successful" }`
- **Constraints**:
  - Role dropdown must only show roles assigned to the user’s email.
  - Invalid login attempts are limited to 5 per user, after which the account is locked until admin intervention or a timeout (e.g., 30 minutes).
  - Rate limit login attempts (e.g., 5 per minute per IP) using NGINX and `slowapi==0.1.9`.
  - Log all login attempts (successful and failed) in the `audit_log` table.

#### 4. Role-Based Security (Functional Access)
- **Functionality**:
  - Roles control what actions a user can perform (functional permissions).
  - Defined roles:
    - **Admin**: Full access (e.g., approve users, manage roles/groups, view/edit all data).
    - **Manager**: Manage samples/workflows within assigned groups, generate reports.
    - **Analyst**: Create/update samples, view/edit assigned workflows.
    - **Read-Only**: View data within assigned groups, no modifications.
  - Users can have multiple roles (e.g., Admin + Manager).
  - Roles are stored in PostgreSQL and assigned during admin approval or later via an admin endpoint.
  - API endpoints are protected by role-based checks.
- **API Endpoints**:
  - `GET /auth/roles`: List available roles (Admin-only).
  - `PATCH /auth/users/{user_id}/roles`: Assign/remove roles (Admin-only).
- **Constraints**:
  - Role checks must be enforced at the API level using JWT claims (e.g., `roles: ["Admin", "Manager"]`).
  - Unauthorized role-based actions return a 403 error (`{ "detail": "Insufficient permissions" }`).

#### 5. Group-Based Security (Data Access)
- **Functionality**:
  - Groups control which data a user can access (e.g., samples, experiments, workflows).
  - Groups are defined by:
    - **Project**: Data tied to specific research projects.
    - **Lab**: Data tied to specific laboratories.
  - Users can belong to multiple groups (e.g., “ProjectX”, “LabA”).
  - Group-based access applies to specific records in PostgreSQL (e.g., `samples`, `workflows`) and MongoDB (e.g., `experiments`).
  - Access is enforced via:
    - **PostgreSQL**: Row-Level Security (RLS) to filter rows by `group_id`.
    - **MongoDB**: API-level filtering by group IDs in queries.
- **API Endpoints**:
  - `GET /auth/groups`: List available groups (Admin or Manager).
  - `PATCH /auth/users/{user_id}/groups`: Assign/remove groups (Admin or Manager).
- **Constraints**:
  - Group IDs are included in JWT claims (e.g., `groups: [1, 2]`).
  - Data access is restricted to records where `group_id` matches the user’s groups.
  - Unauthorized data access returns a 403 error or empty results.

#### 6. Row-Level Security (RLS)
- **Functionality**:
  - RLS is enabled in PostgreSQL for tables like `samples`, `workflows`, and others with a `group_id` column.
  - Policies restrict queries to rows where `group_id` matches the user’s group IDs, derived from the JWT or session context.
  - Admins can bypass RLS for unrestricted access (e.g., via a special role or policy).
- **Constraints**:
  - RLS must be applied during development to avoid retrofitting issues.
  - Policies must be performant, with indexes on `group_id` to optimize queries.
  - RLS errors (e.g., unauthorized access) are logged in the `audit_log` table.

#### 7. Frontend Integration
- **Login Form**:
  - The React frontend provides a login form with fields: `email`, `password`, `role` (dropdown populated based on user’s email).
  - Includes buttons for “Sign Up” and “Forgot Password”.
  - Feedback messages:
    - Signup: “Verification email sent” or “Account created, awaiting admin approval” after verification.
    - Login: “Invalid credentials”, “Account not approved”, or “Account locked after 5 failed attempts”.
- **Signup Form**:
  - Fields: `email`, `password`, `first_name`, `last_name`.
  - Triggers email verification before account creation.
- **Role-Specific UI**:
  - The frontend hides or disables features based on the user’s roles (e.g., Admin sees user approval panel, Read-Only sees view-only data).
  - Role information is derived from the JWT after login.
- **Admin Dashboard**:
  - Displays in-app notifications for pending user approvals.
  - Allows admins to approve users, assign roles/groups, and view audit logs.

#### 8. Scalability and Performance
- **Concurrent Users**: The system must support up to **10 concurrent users**, suitable for a small lab.
- **Session Management**:
  - Use short-lived JWTs (30 minutes) and refresh tokens (7 days) for secure, persistent sessions.
  - Store refresh tokens in PostgreSQL for revocation.
- **Rate Limiting**:
  - Apply NGINX and `slowapi` limits to `/auth/*` endpoints (e.g., 5 requests/minute/IP for login).
- **Database**:
  - Optimize PostgreSQL queries with RLS using indexes on `group_id`.
  - Ensure MongoDB queries for experiments are indexed by `group_id`.

#### 9. External Authentication
- **Capability**:
  - The system must support integration with external identity providers (e.g., LDAP, OAuth2 via Auth0, Okta) for labs with SSO systems.
  - SSO integration is optional and configurable, with fallback to local authentication.
- **Constraints**:
  - External users must map to local roles and groups for consistent access control.
  - SSO configuration must not disrupt the existing OAuth2 password flow.

#### 10. Error Handling and User Experience
- **Signup Feedback**:
  - “Verification email sent” after submitting signup.
  - “Account created, awaiting admin approval” after email verification.
  - “Email already exists” for duplicate emails.
- **Login Feedback**:
  - “Invalid credentials” for wrong email/password.
  - “Account not approved” for unapproved users.
  - “Account locked” after 5 failed login attempts.
  - “Role mismatch” if the selected role isn’t assigned to the user.
- **General**:
  - User-friendly messages are displayed in the React frontend.
  - Detailed errors are logged in the `audit_log` table for admin review.

#### 11. Additional Features
- **Email Notifications**:
  - Send verification emails for signup and password reset links.
  - Emails must include secure, time-limited tokens (e.g., 24-hour expiry).
- **Audit Logging**:
  - Log events: signup, login (success/fail), user approval, role/group changes, session revocation, RLS access denials.
  - Logs include user ID, action, details (e.g., IP address, endpoint), and timestamp.
- **Admin Dashboard**:
  - Provides a React interface for:
    - Viewing and approving pending users.
    - Assigning/removing roles and groups.
    - Reviewing audit logs.
- **Refresh Tokens**:
  - Issued during login and stored in PostgreSQL.
  - Endpoint: `POST /auth/refresh` to generate new access tokens.
  - Admins can revoke refresh tokens to terminate sessions.
- **Group Hierarchies**:
  - Support nested groups (e.g., “LabA > ProjectX”) to allow fine-grained data access.
  - Example: A user in “LabA” can access all projects under “LabA” unless restricted.
- **Rate Limiting**:
  - Apply to `/auth/signup`, `/auth/token`, `/auth/forgot-password` to prevent abuse.
- **Multi-Factor Authentication (MFA)**:
  - Optional MFA for sensitive roles (e.g., Admin) using methods like TOTP or email-based codes.
  - Configurable via admin settings.
- **Session Revocation**:
  - Admins can revoke user sessions via an endpoint (e.g., `DELETE /auth/sessions/{user_id}`).
  - Revocation invalidates all refresh tokens for the user.

#### 12. Database Requirements (PostgreSQL)
- **Tables**:
  - `users`: Stores user data (`id`, `email`, `password_hash`, `first_name`, `last_name`, `is_active`, `created_at`).
  - `roles`: Stores roles (`id`, `name`, `permissions`).
  - `groups`: Stores groups (`id`, `name`, `description`, `parent_group_id` for hierarchies).
  - `user_roles`: Maps users to roles (many-to-many).
  - `user_groups`: Maps users to groups (many-to-many).
  - `audit_log`: Stores audit events (`id`, `user_id`, `action`, `details`, `timestamp`).
  - `refresh_tokens`: Stores refresh tokens (`id`, `user_id`, `token`, `expires_at`).
  - Data tables (e.g., `samples`, `workflows`) include a `group_id` column for RLS.
- **Constraints**:
  - Unique constraints on `email` and `username`.
  - Foreign keys for `group_id`, `user_id`, etc.
  - RLS enabled on data tables with policies based on `group_id`.

#### 13. Non-Functional Requirements
- **Security**:
  - Encrypt passwords with `passlib[bcrypt]==1.7.4`.
  - Use `python-jose[cryptography]==3.4.0` for JWT generation/validation.
  - Enforce HTTPS via NGINX for all API/frontend traffic.
  - Protect against SQL injection, XSS, and CSRF (handled by FastAPI/NGINX).
- **Performance**:
  - Support 10 concurrent users with minimal latency (<500ms for API responses).
  - Optimize RLS queries with indexes on `group_id`.
- **Scalability**:
  - Support horizontal scaling of FastAPI backend via Docker and NGINX load balancing.
  - Compatible with AWS ECS/Kubernetes for future growth.
- **Reliability**:
  - Ensure 99.9% uptime for authentication services.
  - Handle database failures gracefully with connection pooling (`asyncpg==0.30.0`).
- **Usability**:
  - Provide clear, user-friendly feedback in the React frontend.
  - Ensure admin dashboard is intuitive for managing users and logs.

### Integration with Existing Setup
- **FastAPI**: Authentication endpoints (`/auth/*`) and role/group checks are implemented using `fastapi==0.115.12`, leveraging `passlib` and `python-jose`.
- **PostgreSQL**: Stores user data, roles, groups, audit logs, and refresh tokens, with RLS for data tables (`sqlalchemy[asyncio]==2.0.40`, `asyncpg==0.30.0`).
- **MongoDB**: Applies group-based filtering for experiments at the API level (`motor==3.7.0`).
- **React**: Provides login/signup forms and admin dashboard, with role-specific UI rendering.
- **NGINX**: Routes `/api/auth/*` to FastAPI, applies rate limiting, and enforces HTTPS in production.
- **Docker**: Persists user and audit data in `postgres-data` volume, with no changes to `mongo-data` or other services.

### Next Steps
1. **Review Requirements**:
   - Confirm the defined roles (Admin, Manager, Analyst, Read-Only) and groups (Project, Lab) meet your needs.
   - Clarify any additional compliance requirements (e.g., specific audit log retention periods).
2. **Plan Database Schema**:
   - Design tables (`users`, `roles`, `groups`, etc.) and include `group_id` in data tables for RLS.
   - Prepare Alembic migrations for schema setup.
3. **Prioritize Features**:
   - Start with signup (email verification), login, and role-based security.
   - Add RLS and group-based security next, followed by admin dashboard and audit logging.
4. **Update Documentation**:
   - Add authentication/authorization details to `README.md`, including RLS and compliance notes.
   - Document admin notification workflow and SSO capability.
5. **Engage Stakeholders**:
   - Share requirements with your team to validate roles, groups, and UX expectations.

If you need a specific section expanded (e.g., detailed audit log format, SSO integration plan), clarification on any requirement, or help prioritizing features, let me know! Also, any additional compliance standards or UX preferences to include? And no tails in the requirements spec—promise! 😄