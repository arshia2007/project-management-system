\# Database Schema



The Project Management System uses \*\*SQLite\*\* with \*\*Prisma ORM\*\*.



\## Entity Relationship Diagram



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

&#x20;          │

&#x20;          │ 1 : N

&#x20;          │

&#x20;          ▼

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

&#x20;          │

&#x20;          │ 1 : N

&#x20;          │

&#x20;          ▼

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

