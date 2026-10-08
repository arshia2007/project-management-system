# API Documentation

## Project Management System

REST API documentation for the Project Management System backend.

The backend is built using:

-   Node.js

-   Express.js

-   TypeScript

-   Prisma ORM

-   SQLite

-   JWT Authentication

-   bcrypt

-   Zod Validation

------------------------------------------------------------------------

## Base URL

For local development:

``` text

http://localhost:5000/api
```

For deployment, replace the base URL with the deployed backend URL.

------------------------------------------------------------------------

# Authentication

The API uses **JWT (JSON Web Token)** authentication.

Protected endpoints require the following HTTP header:

``` http

Authorization: Bearer <JWT_TOKEN>
```

The JWT token is generated after successful login and is used to
authenticate subsequent requests.

------------------------------------------------------------------------

# 1. Authentication Endpoints

## POST /auth/register

Creates a new user account.

### Request

``` http

POST /api/auth/register

Content-Type: application/json
```

### Request Body

``` json

{

  "fullName": "John Doe",

  "email": "john@example.com",

  "password": "password123"

}
```

### Fields

| Field \| Type \| Required \| Description \|

\|---\|---\|---\|---\|

| fullName \| String \| Yes \| User's full name \|

| email \| String \| Yes \| Unique email address \|

| password \| String \| Yes \| User password \|

### Authentication

Not required.

### Validation

-   Full name must be provided.

-   Email must be valid.

-   Email must be unique.

-   Password must satisfy the backend validation rules.

-   Passwords are hashed using bcrypt before storage.

------------------------------------------------------------------------

## POST /auth/login

Authenticates an existing user.

### Request

``` http

POST /api/auth/login

Content-Type: application/json
```

### Request Body

``` json

{

  "email": "john@example.com",

  "password": "password123"

}
```

### Authentication

Not required.

### Response

A successful login returns an authentication token and user information.

Example:

``` json

{

  "token": "<JWT_TOKEN>",

  "user": {

    "id": "user-id",

    "fullName": "John Doe",

    "email": "john@example.com"

  }

}
```

------------------------------------------------------------------------

## POST /auth/logout

Logs out the currently authenticated user.

### Request

``` http

POST /api/auth/logout

Authorization: Bearer <JWT_TOKEN>
```

### Authentication

Required.

------------------------------------------------------------------------

## GET /auth/me

Returns information about the currently authenticated user.

### Request

``` http

GET /api/auth/me

Authorization: Bearer <JWT_TOKEN>
```

### Authentication

Required.

------------------------------------------------------------------------

# 2. Project Endpoints

Projects belong to authenticated users.

Users can only access and modify their own projects.

------------------------------------------------------------------------

## GET /projects

Returns all projects belonging to the authenticated user.

### Request

``` http

GET /api/projects

Authorization: Bearer <JWT_TOKEN>
```

### Authentication

Required.

### Features

The endpoint supports retrieving the user's projects and is used by both
the web and mobile applications.

------------------------------------------------------------------------

## GET /projects/:id

Returns details of a specific project.

### Request

``` http

GET /api/projects/{id}

Authorization: Bearer <JWT_TOKEN>
```

### Parameters

| Parameter \| Type \| Description \|

\|---\|---\|---\|

| id \| String \| Project ID \|

### Authentication

Required.

### Authorization

A user can only access their own project.

------------------------------------------------------------------------

## POST /projects

Creates a new project.

### Request

``` http

POST /api/projects

Authorization: Bearer <JWT_TOKEN>

Content-Type: application/json
```

### Request Body

``` json

{

  "name": "Website Development",

  "description": "Develop the company website",

  "status": "Not Started",

  "startDate": "2026-10-01",

  "endDate": "2026-11-01"

}
```

### Fields

| Field \| Type \| Required \| Description \|

\|---\|---\|---\|---\|

| name \| String \| Yes \| Project name \|

| description \| String \| No \| Project description \|

| status \| String \| No \| Not Started, In Progress, or Completed \|

| startDate \| Date \| No \| Project start date \|

| endDate \| Date \| No \| Project end date \|

### Authentication

Required.

------------------------------------------------------------------------

## PUT /projects/:id

Updates an existing project.

### Request

``` http

PUT /api/projects/{id}

Authorization: Bearer <JWT_TOKEN>

Content-Type: application/json
```

### Parameters

| Parameter \| Type \| Description \|

\|---\|---\|---\|

| id \| String \| Project ID \|

### Example Request Body

``` json

{

  "name": "Updated Website Development",

  "description": "Updated project description",

  "status": "In Progress"

}
```

### Authentication

Required.

### Authorization

Users can only modify their own projects.

------------------------------------------------------------------------

## DELETE /projects/:id

Deletes an existing project.

### Request

``` http

DELETE /api/projects/{id}

Authorization: Bearer <JWT_TOKEN>
```

### Parameters

| Parameter \| Type \| Description \|

\|---\|---\|---\|

| id \| String \| Project ID \|

### Authentication

Required.

### Authorization

Users can only delete their own projects.

### Cascade Behavior

Deleting a project also deletes its associated tasks through the
database relationship.

------------------------------------------------------------------------

# 3. Task Endpoints

Tasks belong to projects.

Users can only access tasks belonging to their own projects.

------------------------------------------------------------------------

## GET /tasks

Returns tasks available to the authenticated user.

### Request

``` http

GET /api/tasks

Authorization: Bearer <JWT_TOKEN>
```

### Authentication

Required.

### Features

The endpoint is used by the web and mobile applications for retrieving
tasks.

------------------------------------------------------------------------

## GET /tasks/:id

Returns a specific task.

### Request

``` http

GET /api/tasks/{id}

Authorization: Bearer <JWT_TOKEN>
```

### Parameters

| Parameter \| Type \| Description \|

\|---\|---\|---\|

| id \| String \| Task ID \|

### Authentication

Required.

### Authorization

Users can only access tasks belonging to their own projects.

------------------------------------------------------------------------

## POST /tasks

Creates a new task.

### Request

``` http

POST /api/tasks

Authorization: Bearer <JWT_TOKEN>

Content-Type: application/json
```

### Request Body

``` json

{

  "name": "Implement Login",

  "description": "Create login functionality",

  "priority": "High",

  "status": "Pending",

  "dueDate": "2026-10-15",

  "projectId": "project-id"

}
```

### Fields

| Field \| Type \| Required \| Description \|

\|---\|---\|---\|---\|

| name \| String \| Yes \| Task name \|

| description \| String \| No \| Task description \|

| priority \| String \| No \| Low, Medium, or High \|

| status \| String \| No \| Pending, In Progress, or Completed \|

| dueDate \| Date \| No \| Task due date \|

| projectId \| String \| Yes \| ID of the project \|

### Authentication

Required.

------------------------------------------------------------------------

## PUT /tasks/:id

Updates an existing task.

### Request

``` http

PUT /api/tasks/{id}

Authorization: Bearer <JWT_TOKEN>

Content-Type: application/json
```

### Parameters

| Parameter \| Type \| Description \|

\|---\|---\|---\|

| id \| String \| Task ID \|

### Example Request Body

``` json

{

  "name": "Implement Login",

  "priority": "High",

  "status": "Completed"

}
```

### Authentication

Required.

### Authorization

Users can only modify tasks belonging to their own projects.

------------------------------------------------------------------------

## DELETE /tasks/:id

Deletes an existing task.

### Request

``` http

DELETE /api/tasks/{id}

Authorization: Bearer <JWT_TOKEN>
```

### Parameters

| Parameter \| Type \| Description \|

\|---\|---\|---\|

| id \| String \| Task ID \|

### Authentication

Required.

### Authorization

Users can only delete tasks belonging to their own projects.

------------------------------------------------------------------------

# 4. Dashboard Endpoint

## GET /dashboard

Returns dashboard statistics for the authenticated user.

### Request

``` http

GET /api/dashboard

Authorization: Bearer <JWT_TOKEN>
```

### Authentication

Required.

### Dashboard Statistics

The dashboard provides statistics including:

-   Total Projects

-   Total Tasks

-   Completed Tasks

-   Pending Tasks

-   Projects In Progress

The statistics are calculated using the authenticated user's data.

------------------------------------------------------------------------

# 5. HTTP Status Codes

The API uses standard HTTP status codes.

| Status Code \| Meaning \|

\|---\|---\|

| 200 \| Request successful \|

| 201 \| Resource created successfully \|

| 400 \| Bad request / validation error \|

| 401 \| Unauthorized / invalid authentication \|

| 403 \| Forbidden \|

| 404 \| Resource not found \|

| 409 \| Conflict \|

| 429 \| Too many requests \|

| 500 \| Internal server error \|

------------------------------------------------------------------------

# 6. Input Validation

Incoming API requests are validated on the backend using **Zod
schemas**.

Validation is applied to user-provided data such as:

-   User registration information

-   Login credentials

-   Project information

-   Task information

-   Status values

-   Priority values

-   Dates

-   Required fields

Invalid requests return an appropriate error response instead of being
directly passed to the database.

------------------------------------------------------------------------

# 7. Authentication & Authorization

The backend uses JWT-based authentication.

Protected endpoints require a valid JWT token.

Authorization is also enforced so that:

-   Users can only view their own projects.

-   Users can only modify their own projects.

-   Users can only delete their own projects.

-   Users can only access tasks belonging to their own projects.

-   Users cannot access another user's project or task data.

------------------------------------------------------------------------

# 8. Password Security

Passwords are never stored as plain text.

The backend uses **bcrypt** to hash passwords before storing them in the
database.

During login, the supplied password is compared against the stored
password hash.

------------------------------------------------------------------------

# 9. API Security

The backend implements multiple security measures including:

-   JWT authentication

-   Authentication middleware

-   Protected routes

-   bcrypt password hashing

-   Zod input validation

-   Rate limiting on authentication endpoints

-   ORM-based database access

-   Centralized error handling

-   User-level authorization

The database layer uses Prisma ORM to avoid unsafe raw SQL queries and
reduce SQL injection risks.

------------------------------------------------------------------------

# 10. Rate Limiting

Authentication endpoints are protected using rate limiting to reduce the
risk of repeated brute-force login or registration attempts.

When the request limit is exceeded, the API returns:

``` text

429 Too Many Requests
```

------------------------------------------------------------------------

# 11. Database

The backend uses:

-   SQLite database

-   Prisma ORM

Main database entities:

``` text

User

  |

  | 1:N

  v

Project

  |

  | 1:N

  v

Task
```

### User

Stores registered user information.

### Project

Stores projects belonging to users.

### Task

Stores tasks belonging to projects.

Projects and tasks use foreign-key relationships to maintain relational
integrity.

------------------------------------------------------------------------

# 12. API Endpoint Summary

| Method \| Endpoint \| Authentication \| Description \|

\|---\|---\|---\|---\|

| POST \| `/api/auth/register` \| No \| Register user \|

| POST \| `/api/auth/login` \| No \| Login \|

| POST \| `/api/auth/logout` \| Yes \| Logout \|

| GET \| `/api/auth/me` \| Yes \| Get current user \|

| GET \| `/api/projects` \| Yes \| Get user's projects \|

| GET \| `/api/projects/{id}` \| Yes \| Get project \|

| POST \| `/api/projects` \| Yes \| Create project \|

| PUT \| `/api/projects/{id}` \| Yes \| Update project \|

| DELETE \| `/api/projects/{id}` \| Yes \| Delete project \|

| GET \| `/api/tasks` \| Yes \| Get user's tasks \|

| GET \| `/api/tasks/{id}` \| Yes \| Get task \|

| POST \| `/api/tasks` \| Yes \| Create task \|

| PUT \| `/api/tasks/{id}` \| Yes \| Update task \|

| DELETE \| `/api/tasks/{id}` \| Yes \| Delete task \|

| GET \| `/api/dashboard` \| Yes \| Get dashboard statistics \|

------------------------------------------------------------------------

# 13. Swagger Documentation

The backend provides interactive Swagger/OpenAPI documentation.

When running the backend locally, open:

``` text

http://localhost:5000/api/docs/
```

Swagger can be used to:

-   View available endpoints

-   View request parameters

-   View request bodies

-   Test API endpoints

-   Test authenticated requests

-   Inspect API responses

------------------------------------------------------------------------

# 14. Running the API Locally

Navigate to the backend directory:

``` bash

cd backend
```

Install dependencies:

``` bash

npm install
```

Generate the Prisma client:

``` bash

npx prisma generate
```

Run database migrations/setup as required:

``` bash

npx prisma migrate dev
```

Seed the database:

``` bash

npm run prisma:seed
```

Start the development server:

``` bash

npm run dev
```

The API will then be available at:

``` text

http://localhost:5000/api
```

Swagger documentation:

``` text

http://localhost:5000/api/docs/
```

------------------------------------------------------------------------

# 15. API Testing

The backend includes automated API/integration tests covering:

-   User registration

-   User login

-   Authentication

-   Protected routes

-   Project CRUD operations

-   Task CRUD operations

-   Dashboard functionality

-   Authorization

-   Validation

-   Error handling

Run the tests using:

``` bash

npm test
```

------------------------------------------------------------------------

# 16. Web and Mobile Integration

The same backend API is consumed by both applications:

``` text

                ┌──────────────┐

                │    Backend   │

                │ Express API  │

                └──────┬───────┘

                       │

             ┌─────────┴─────────┐

             │                   │

             ▼                   ▼

      ┌─────────────┐     ┌─────────────┐

      │ Web React   │     │ Mobile Expo │

      │ Application │     │ Application │

      └─────────────┘     └─────────────┘
```

Both applications use the same authentication system, API endpoints, and
database.

Therefore, data created or modified from one application can be accessed
from the other application after refreshing/synchronizing the data.

------------------------------------------------------------------------

# 17. API Architecture

The backend follows a layered REST API architecture:

``` text

Client

  |

  v

Routes

  |

  v

Middleware

  |

  v

Controllers

  |

  v

Validation / Business Logic

  |

  v

Prisma ORM

  |

  v

SQLite Database
```

This structure separates routing, authentication, validation, business
logic, and database access.

------------------------------------------------------------------------

# 18. Related Documentation

Additional project documentation:

-   [README](README.md)

-   [Database Schema](DATABASE_SCHEMA.md)

------------------------------------------------------------------------

## Project Repository

The complete source code contains:

-   Backend

-   Web application

-   Mobile application

-   Database schema

-   API documentation

-   Tests

-   Docker configuration

-   Environment variable examples
