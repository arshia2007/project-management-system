# Database Schema

The Project Management System uses **SQLite** with **Prisma ORM**.

## Entity Relationship Diagram

```text
┌─────────────────────┐
│        User         │
├─────────────────────┤
│ PK id               │
│ fullName            │
│ UNIQUE email        │
│ password            │
│ createdAt           │
│ updatedAt           │
└──────────┬──────────┘
           │
           │ 1 : N
           │
           ▼
┌─────────────────────┐
│       Project       │
├─────────────────────┤
│ PK id               │
│ name                │
│ description         │
│ status              │
│ startDate           │
│ endDate             │
│ createdAt           │
│ updatedAt           │
│ FK userId           │
└──────────┬──────────┘
           │
           │ 1 : N
           │
           ▼
┌─────────────────────┐
│        Task         │
├─────────────────────┤
│ PK id               │
│ name                │
│ description         │
│ priority            │
│ status              │
│ dueDate             │
│ createdAt           │
│ updatedAt           │
│ FK projectId        │
└─────────────────────┘
