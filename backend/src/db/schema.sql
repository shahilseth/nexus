-- Nexus Database Schema
-- Run this in the Supabase SQL editor: Dashboard → SQL Editor → New Query → paste → Run

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  status      TEXT NOT NULL DEFAULT 'On Track', -- 'On Track' | 'At Risk' | 'Blocked'
  owner_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  due_date    DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'member', -- 'admin' | 'member'
  joined_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

CREATE TABLE IF NOT EXISTS tasks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  priority    TEXT NOT NULL DEFAULT 'medium', -- 'high' | 'medium' | 'low'
  status      TEXT NOT NULL DEFAULT 'Backlog', -- 'Backlog' | 'Todo' | 'In Progress' | 'Review' | 'Done'
  due_date    DATE,
  ai_suggested BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS task_dependencies (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id           UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  depends_on_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  UNIQUE(task_id, depends_on_task_id)
);

CREATE TABLE IF NOT EXISTS activity_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  entity_type TEXT, -- 'project' | 'task' | 'member'
  entity_id   UUID,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
