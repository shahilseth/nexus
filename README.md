# Nexus

**Team task orchestration platform for AI-first companies.**  
Plan, assign, and ship work with your team and your agents — all in one calm place.

GitHub: [github.com/shahilseth/nexus](https://github.com/shahilseth/nexus)

---

## Features

- **Kanban board** — drag tasks across Backlog → Todo → In Progress → Review → Done
- **Role toggle** — instantly switch Admin / Member view across all pages
- **AI Pulse** — AI-generated team health summary on the dashboard
- **Task side panel** — click any task for full detail, dependencies, and activity timeline
- **Command palette** — Cmd+K global search across projects, tasks, and people
- **JWT auth** — secure login/signup with bcrypt password hashing
- **Role-based API** — Admins can CRUD everything; Members can only update their own task status
- **Supabase PostgreSQL** — real database with realistic seed data

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | Next.js 14, App Router, TypeScript  |
| Backend   | Express, TypeScript, pg             |
| Database  | PostgreSQL via Supabase              |
| Auth      | JWT (jsonwebtoken) + bcrypt          |
| Hosting   | Railway (frontend + backend)         |

---

## Local Setup

### 1. Clone and install

```bash
git clone https://github.com/shahilseth/nexus.git
cd nexus
npm install   # installs all workspaces
```

### 2. Set up the database (Supabase)

1. Go to [supabase.com](https://supabase.com) → create a new project
2. Once created, go to **SQL Editor** → **New Query**
3. Paste the contents of `backend/src/db/schema.sql` → click **Run**
4. Create a new query, paste `backend/src/db/seed.sql` → click **Run**

This creates all tables and populates them with:
- 5 users (Shahil Seth as Admin, Aria Sen, Riya Kapoor, Marcus Lee, Devon Park)
- 3 projects (Nexus, Atlas Migration, Pulse Analytics)
- 17 tasks across all projects
- Activity log entries

### 3. Configure environment variables

**Backend** — copy and fill in `backend/.env.example` → `backend/.env`:

```
PORT=5000
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
JWT_SECRET=any-long-random-string
```

To find your `DATABASE_URL`:
- Supabase dashboard → **Settings** → **Database** → **Connection string** → copy the URI

**Frontend** — copy `frontend/.env.example` → `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 4. Run the app

Open two terminals:

```bash
# Terminal 1 — backend
cd nexus/backend
npm install
npm run dev

# Terminal 2 — frontend
cd nexus/frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Login credentials (from seed data):**
- Email: `shahil@nexus.app` — Password: `password` (Admin)
- Email: `aria@nexus.app` — Password: `password` (Member)

---

## API Routes Reference

### Auth
| Method | Route             | Description               | Auth required |
|--------|-------------------|---------------------------|---------------|
| POST   | /api/auth/signup  | Create account            | No            |
| POST   | /api/auth/login   | Login, returns JWT        | No            |

### Projects
| Method | Route              | Description                  | Role     |
|--------|--------------------|------------------------------|----------|
| GET    | /api/projects      | List all (or yours if member)| Any      |
| POST   | /api/projects      | Create project               | Admin    |
| GET    | /api/projects/:id  | Single project + tasks       | Any      |
| PUT    | /api/projects/:id  | Update project               | Admin    |
| DELETE | /api/projects/:id  | Delete project               | Admin    |

### Tasks
| Method | Route           | Description                         | Role              |
|--------|-----------------|-------------------------------------|-------------------|
| GET    | /api/tasks      | List tasks for a project (?projectId)| Any              |
| POST   | /api/tasks      | Create task                          | Admin             |
| PUT    | /api/tasks/:id  | Update task                          | Admin (all fields); Member (status only, own tasks) |
| DELETE | /api/tasks/:id  | Delete task                          | Admin             |

### Members
| Method | Route                | Description               | Role  |
|--------|----------------------|---------------------------|-------|
| GET    | /api/members         | List all users            | Any   |
| POST   | /api/members/invite  | Add member to project     | Admin |
| DELETE | /api/members/:id     | Remove member             | Admin |

### Activity
| Method | Route          | Description                        | Auth     |
|--------|----------------|------------------------------------|----------|
| GET    | /api/activity  | Activity feed (?projectId optional)| Any      |

---

## Railway Deployment

Railway lets you deploy the frontend and backend as two separate services, connected to Supabase.

### 1. Deploy the backend

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select your repo, set the **Root Directory** to `backend`
3. Set these environment variables in Railway:
   - `DATABASE_URL` — your Supabase connection string
   - `JWT_SECRET` — a long random string
   - `PORT` — Railway sets this automatically
4. Railway will run `npm run build && npm start`

### 2. Deploy the frontend

1. New service in the same Railway project → Deploy from GitHub
2. Set the **Root Directory** to `frontend`
3. Set environment variable:
   - `NEXT_PUBLIC_API_URL` — the URL of your backend service (e.g. `https://nexus-backend.up.railway.app`)
4. Railway will run `npm run build && npm start`

### 3. (Optional) Custom domain

In Railway → your service → **Settings** → **Domains** → add your domain.

---

## File Structure

```
nexus/
├── frontend/                  Next.js 14 (App Router)
│   ├── app/
│   │   ├── globals.css        All design system CSS
│   │   ├── layout.tsx         Root layout with auth + role providers
│   │   ├── page.tsx           Redirect to /login
│   │   ├── login/page.tsx     Login + Signup
│   │   ├── dashboard/page.tsx Dashboard
│   │   ├── projects/page.tsx  Project grid
│   │   ├── projects/[id]/     Kanban board + task panel
│   │   └── team/page.tsx      Team members
│   ├── components/
│   │   ├── AppShell.tsx       Protected layout wrapper
│   │   ├── Sidebar.tsx        Navigation sidebar
│   │   ├── Topbar.tsx         Top navigation bar
│   │   ├── Avatar.tsx         Monogram avatar
│   │   ├── Badge.tsx          Status/role badges
│   │   ├── CommandPalette.tsx Cmd+K search modal
│   │   └── TaskPanel.tsx      Task detail slide-in panel
│   ├── context/
│   │   ├── AuthContext.tsx    JWT auth state
│   │   └── RoleContext.tsx    Admin/Member role toggle
│   └── lib/api.ts             Axios API client
│
├── backend/                   Express + TypeScript
│   ├── src/
│   │   ├── index.ts           Server entry point
│   │   ├── db/
│   │   │   ├── index.ts       pg Pool connection
│   │   │   ├── schema.sql     Database tables
│   │   │   └── seed.sql       Sample data
│   │   ├── middleware/
│   │   │   └── auth.ts        JWT verification
│   │   └── routes/
│   │       ├── auth.ts        Login/signup
│   │       ├── projects.ts    Project CRUD
│   │       ├── tasks.ts       Task CRUD
│   │       ├── members.ts     Team management
│   │       └── activity.ts    Activity feed
│   └── .env.example
│
├── package.json               npm workspaces root
└── README.md
```
