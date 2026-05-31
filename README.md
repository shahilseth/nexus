<div align="center">

# Nexus

**Team task orchestration platform for AI-first companies**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Open%20App-brightgreen?style=for-the-badge&logo=railway&logoColor=white)](https://nexus-frontend-production-e212.up.railway.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repo-181717?style=for-the-badge&logo=github)](https://github.com/shahilseth/nexus)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org)
[![Express](https://img.shields.io/badge/Express.js-Backend-000000?style=for-the-badge&logo=express)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://supabase.com)

</div>

---

## Preview

![Nexus Dashboard](./screenshots/dashboard.png)

---

## Features

| | Feature |
|---|---|
| 🔐 | **Authentication** — Signup and login with JWT; 7-day session tokens, bcrypt password hashing |
| 🛡️ | **Role-based access** — Admin and Member roles enforced on every API route and UI element |
| 📁 | **Project management** — Create, update, and delete projects; real-time progress calculated from task completion |
| 👥 | **Team management** — Invite and remove members per project; assigning a task auto-enrolls the user |
| 📋 | **Kanban board** — Five columns: Backlog → Todo → In Progress → Review → Done |
| 🖱️ | **Drag & drop** — Move tasks between columns via HTML5 drag-and-drop or an inline status selector |
| 🔍 | **Searchable member picker** — Live-filtered dropdown for inviting and assigning members |
| 📊 | **Activity feed** — Per-project log of every create, update, and move event |
| ✨ | **AI Pulse card** — Dashboard widget surfacing overdue tasks, capacity alerts, and today's deadlines |
| ⌘ | **Command palette** — `⌘K` / `Ctrl+K` searches projects and people in real time |
| 📱 | **Mobile responsive** — Bottom navigation, bottom-sheet modals, and 44px touch targets |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS |
| **Backend** | Express.js, TypeScript |
| **Database** | PostgreSQL via Supabase |
| **Auth** | JSON Web Tokens + bcrypt |
| **Deployment** | Railway |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)
- npm 9+ (workspaces are used at the repo root)

### 1 — Clone the repository

```bash
git clone https://github.com/shahilseth/nexus.git
cd nexus
```

### 2 — Install all dependencies

```bash
npm install
```

This installs both `frontend` and `backend` workspaces in one command.

### 3 — Set up environment variables

**Backend** — copy the example file and fill in your values:

```bash
cp backend/.env.example backend/.env
```

**Frontend** — copy the example file:

```bash
cp frontend/.env.example frontend/.env.local
```

See [Environment Variables](#environment-variables) below for what each key means.

### 4 — Create the database schema

1. Open your [Supabase dashboard](https://supabase.com/dashboard)
2. Go to **SQL Editor** → **New query**
3. Paste the contents of [`backend/src/db/schema.sql`](./backend/src/db/schema.sql) and click **Run**

### 5 — Seed demo data *(optional but recommended)*

In the same SQL Editor, open a new query, paste [`backend/src/db/seed.sql`](./backend/src/db/seed.sql), and click **Run**.

This creates 5 users, 6 projects, 30+ tasks across all five kanban columns, and a realistic activity log — so the app looks fully populated on first load.

### 6 — Start the development servers

Open two terminal tabs:

```bash
# Terminal 1 — Backend API (http://localhost:3001)
npm run dev:backend

# Terminal 2 — Frontend (http://localhost:3000)
npm run dev:frontend
```

Open [http://localhost:3000](http://localhost:3000) and log in with the [demo credentials](#demo-credentials) below.

---

## Environment Variables

### Backend — `backend/.env`

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port the Express server listens on | `3001` |
| `DATABASE_URL` | PostgreSQL connection string from Supabase Settings → Database → URI | `postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres` |
| `JWT_SECRET` | Secret used to sign JWT tokens — use a long random string in production | `a_long_random_secret` |
| `ALLOWED_ORIGINS` | Comma-separated list of frontend origins permitted by CORS | `http://localhost:3000` |

### Frontend — `frontend/.env.local`

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Full URL of the running backend service | `http://localhost:3001` |

---

## API Reference

All protected routes require `Authorization: Bearer <token>`.  
`[admin]` = Admin only · `[auth]` = Any authenticated user

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | — | Register a new user account |
| `POST` | `/api/auth/login` | — | Log in and receive a signed JWT |

### Projects

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/projects` | `[auth]` | List projects — Admins see all, Members see only their own |
| `POST` | `/api/projects` | `[admin]` | Create a new project |
| `GET` | `/api/projects/:id` | `[auth]` | Get a project with its tasks, members, and dependencies |
| `PUT` | `/api/projects/:id` | `[admin]` | Update project name, description, status, or due date |
| `DELETE` | `/api/projects/:id` | `[admin]` | Permanently delete a project and all its tasks |

### Tasks

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/tasks?projectId=` | `[auth]` | List all tasks for a project |
| `POST` | `/api/tasks` | `[admin]` | Create a task; auto-adds assignee to project members |
| `PUT` | `/api/tasks/:id` | `[auth]` | Admins update any field; Members update status on their own tasks only |
| `DELETE` | `/api/tasks/:id` | `[admin]` | Delete a task |

### Members

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/members` | `[auth]` | List all workspace users |
| `GET` | `/api/members?projectId=` | `[auth]` | List project members, including task assignees not yet formally invited |
| `POST` | `/api/members/invite` | `[admin]` | Add a user to a project by email address |
| `DELETE` | `/api/members/:userId` | `[admin]` | Remove a member from all projects |
| `DELETE` | `/api/members/:userId?projectId=` | `[admin]` | Remove a member from one specific project |

### Activity

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/activity` | `[auth]` | Global activity feed — last 50 entries across all projects |
| `GET` | `/api/activity?projectId=` | `[auth]` | Activity feed scoped to a single project |

### Stats

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/stats` | `[auth]` | Dashboard counters (project count, tasks due today, overdue, team capacity) — scoped by role |

### Health

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | — | Liveness check — returns `{ ok: true }` |

---

## Deployment on Railway

### Backend service

1. Push your code to GitHub.
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**.
3. Select your repo and set **Root Directory** to `backend`.
4. Railway detects `package.json` and runs `npm start` automatically.
5. Add the following environment variables under **Variables**:

   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | Your Supabase connection string |
   | `JWT_SECRET` | A long random secret |
   | `ALLOWED_ORIGINS` | Your Railway frontend URL *(add this after the frontend is deployed)* |

6. Copy the generated backend URL (e.g. `https://nexus-backend-production.up.railway.app`).

### Frontend service

1. In the same Railway project, add a new service → **Deploy from GitHub repo**.
2. Set **Root Directory** to `frontend`.
3. Add the following environment variable:

   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | The backend URL from the previous step |

4. Once deployed, copy the frontend URL and go back to your backend service.
5. Update `ALLOWED_ORIGINS` to include the frontend URL, then click **Redeploy**.

---

## Demo Credentials

The seed file creates the following accounts. All passwords are `password`.

| Role | Name | Email | Password |
|---|---|---|---|
| **Admin** | Shahil Seth | `shahil@nexus.app` | `password` |
| Member | Aria Sen | `aria@nexus.app` | `password` |
| Member | Riya Kapoor | `riya@nexus.app` | `password` |
| Member | Marcus Lee | `marcus@nexus.app` | `password` |
| Member | Devon Park | `devon@nexus.app` | `password` |

> **Admin** can create and delete projects, create and assign tasks, invite and remove team members, and see every project in the workspace.  
> **Members** can view projects they belong to and update the status of tasks assigned to them.

---

## Project Structure

```
nexus/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.sql          # All table definitions
│   │   │   ├── seed.sql            # Demo users, projects, tasks, and activity
│   │   │   └── index.ts            # PostgreSQL connection pool (pg)
│   │   ├── middleware/
│   │   │   └── auth.ts             # JWT verification + role guards (requireAuth, requireAdmin)
│   │   ├── routes/
│   │   │   ├── auth.ts             # POST /signup, POST /login
│   │   │   ├── projects.ts         # CRUD /projects
│   │   │   ├── tasks.ts            # CRUD /tasks + auto-member enrollment
│   │   │   ├── members.ts          # /members invite, list, remove
│   │   │   ├── activity.ts         # GET /activity
│   │   │   └── stats.ts            # GET /stats (role-scoped counters)
│   │   └── index.ts                # Express app + CORS + route mounting
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── app/
│   │   ├── globals.css             # Full design system — tokens, layout, components
│   │   ├── layout.tsx              # Root layout with AuthProvider + RoleProvider
│   │   ├── page.tsx                # Redirects to /login or /dashboard
│   │   ├── login/page.tsx          # Login + Signup page
│   │   ├── dashboard/page.tsx      # Stats, recent projects table, AI Pulse, activity feed
│   │   ├── projects/
│   │   │   ├── page.tsx            # Project grid with create + delete
│   │   │   └── [id]/page.tsx       # Kanban board, team members, activity feed
│   │   └── team/page.tsx           # Workspace-wide member cards + invite modal
│   ├── components/
│   │   ├── AppShell.tsx            # Auth guard + sidebar + topbar shell
│   │   ├── Sidebar.tsx             # Desktop navigation + role toggle
│   │   ├── BottomNav.tsx           # Mobile bottom navigation bar
│   │   ├── Topbar.tsx              # Search trigger + action buttons
│   │   ├── TaskPanel.tsx           # Slide-in task detail panel with live activity
│   │   ├── MemberSelect.tsx        # Searchable member picker dropdown
│   │   ├── CommandPalette.tsx      # ⌘K search palette (projects + people)
│   │   ├── Avatar.tsx              # Monogram avatar with deterministic color
│   │   └── Badge.tsx               # Status / role / AI badges
│   ├── context/
│   │   ├── AuthContext.tsx         # JWT auth state + login/logout
│   │   └── RoleContext.tsx         # Admin/Member UI role (persisted to localStorage)
│   ├── lib/
│   │   └── api.ts                  # Axios client with auth interceptor + all API calls
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── screenshots/
│   └── dashboard.png
├── package.json                    # npm workspaces root (dev:frontend, dev:backend)
└── README.md
```

---

<div align="center">

Built with Next.js · Express · PostgreSQL · Deployed on Railway

</div>
