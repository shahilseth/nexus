-- Nexus Seed Data
-- Run AFTER schema.sql in the Supabase SQL editor.
-- This creates 2 users, 3 projects, 14 tasks, and activity log entries.

-- Passwords are both: "password" (bcrypt hash)
INSERT INTO users (id, name, email, password_hash, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Shahil Seth',  'shahil@nexus.app',  '$2a$10$GOZ5T7YBy8WisfkaRBU7aeUGNelLFQmZcz4OJ4f0Jjh0kWPxTFzw2', '2024-01-15 09:00:00+00'),
  ('22222222-2222-2222-2222-222222222222', 'Aria Sen',     'aria@nexus.app',    '$2a$10$GOZ5T7YBy8WisfkaRBU7aeUGNelLFQmZcz4OJ4f0Jjh0kWPxTFzw2', '2024-01-15 09:10:00+00'),
  ('33333333-3333-3333-3333-333333333333', 'Riya Kapoor',  'riya@nexus.app',    '$2a$10$GOZ5T7YBy8WisfkaRBU7aeUGNelLFQmZcz4OJ4f0Jjh0kWPxTFzw2', '2024-03-10 10:00:00+00'),
  ('44444444-4444-4444-4444-444444444444', 'Marcus Lee',   'marcus@nexus.app',  '$2a$10$GOZ5T7YBy8WisfkaRBU7aeUGNelLFQmZcz4OJ4f0Jjh0kWPxTFzw2', '2024-02-20 11:00:00+00'),
  ('55555555-5555-5555-5555-555555555555', 'Devon Park',   'devon@nexus.app',   '$2a$10$GOZ5T7YBy8WisfkaRBU7aeUGNelLFQmZcz4OJ4f0Jjh0kWPxTFzw2', '2024-06-01 12:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- Projects
INSERT INTO projects (id, name, description, status, owner_id, due_date, created_at) VALUES
  ('aaaa0001-0000-0000-0000-000000000000', 'Nexus',             'Core task orchestration platform and the AI scheduling engine behind it.',    'On Track', '11111111-1111-1111-1111-111111111111', '2026-06-12', '2026-05-01 08:00:00+00'),
  ('aaaa0002-0000-0000-0000-000000000000', 'Atlas Migration',   'Move billing and identity off the legacy monolith without downtime.',          'At Risk',  '11111111-1111-1111-1111-111111111111', '2026-06-05', '2026-04-15 09:00:00+00'),
  ('aaaa0003-0000-0000-0000-000000000000', 'Pulse Analytics',   'Real-time usage dashboards customers can share with their teams.',            'On Track', '11111111-1111-1111-1111-111111111111', '2026-07-01', '2026-05-10 10:00:00+00'),
  ('aaaa0004-0000-0000-0000-000000000000', 'Orbit Mobile',      'Native iOS and Android companion app with offline support.',                  'Blocked',  '11111111-1111-1111-1111-111111111111', '2026-06-20', '2026-04-20 09:00:00+00'),
  ('aaaa0005-0000-0000-0000-000000000000', 'Beacon Onboarding', 'Guided setup and a first-run experience that gets teams live fast.',          'On Track', '11111111-1111-1111-1111-111111111111', '2026-06-28', '2026-05-05 10:00:00+00'),
  ('aaaa0006-0000-0000-0000-000000000000', 'Harbor API',        'Public REST and webhook platform with self-serve key management.',            'At Risk',  '11111111-1111-1111-1111-111111111111', '2026-06-15', '2026-05-08 11:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- Project members
INSERT INTO project_members (project_id, user_id, role, joined_at) VALUES
  ('aaaa0001-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'admin',  '2026-05-01 08:00:00+00'),
  ('aaaa0001-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'member', '2026-05-02 09:00:00+00'),
  ('aaaa0001-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'member', '2026-05-03 10:00:00+00'),
  ('aaaa0001-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444', 'member', '2026-05-04 11:00:00+00'),
  ('aaaa0002-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'admin',  '2026-04-15 09:00:00+00'),
  ('aaaa0002-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'member', '2026-04-15 09:00:00+00'),
  ('aaaa0002-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444', 'member', '2026-04-16 10:00:00+00'),
  ('aaaa0002-0000-0000-0000-000000000000', '55555555-5555-5555-5555-555555555555', 'member', '2026-04-17 11:00:00+00'),
  ('aaaa0003-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'admin',  '2026-05-10 10:00:00+00'),
  ('aaaa0003-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'member', '2026-05-10 10:00:00+00'),
  ('aaaa0003-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'member', '2026-05-11 11:00:00+00')
ON CONFLICT (project_id, user_id) DO NOTHING;

-- Tasks for Nexus project
INSERT INTO tasks (id, project_id, title, description, assignee_id, priority, status, due_date, ai_suggested, created_at) VALUES
  ('bbbb0001-0000-0000-0000-000000000000', 'aaaa0001-0000-0000-0000-000000000000', 'Spec notification preferences', 'Define which events notify whom and through what channel. Cover email, in-app, and digest options.', '22222222-2222-2222-2222-222222222222', 'low',    'Backlog',     '2026-06-18', false, '2026-05-20 08:00:00+00'),
  ('bbbb0002-0000-0000-0000-000000000000', 'aaaa0001-0000-0000-0000-000000000000', 'Audit onboarding copy',          'Review all user-facing copy in the onboarding flow for clarity and tone.',                     '22222222-2222-2222-2222-222222222222', 'low',    'Backlog',     '2026-06-20', false, '2026-05-21 09:00:00+00'),
  ('bbbb0003-0000-0000-0000-000000000000', 'aaaa0001-0000-0000-0000-000000000000', 'Research calendar sync',         'Evaluate Google Calendar and Outlook integration options for task due dates.',                 '33333333-3333-3333-3333-333333333333', 'medium', 'Backlog',     '2026-06-22', false, '2026-05-22 10:00:00+00'),
  ('bbbb0004-0000-0000-0000-000000000000', 'aaaa0001-0000-0000-0000-000000000000', 'Build AI priority suggester',    'Train the model that scores incoming tasks and proposes a priority. Surface an AI badge wherever a suggestion is applied.', '33333333-3333-3333-3333-333333333333', 'high',   'Todo',        '2026-06-10', true,  '2026-05-23 08:00:00+00'),
  ('bbbb0005-0000-0000-0000-000000000000', 'aaaa0001-0000-0000-0000-000000000000', 'Design empty states v2',         'Improve empty state screens across all views — projects, tasks, team, and search.',             '22222222-2222-2222-2222-222222222222', 'medium', 'Todo',        '2026-06-09', false, '2026-05-24 09:00:00+00'),
  ('bbbb0006-0000-0000-0000-000000000000', 'aaaa0001-0000-0000-0000-000000000000', 'Set up webhook retries',         'Implement exponential backoff and dead-letter queue for failed webhook deliveries.',           '44444444-4444-4444-4444-444444444444', 'medium', 'Todo',        '2026-06-14', false, '2026-05-25 10:00:00+00'),
  ('bbbb0007-0000-0000-0000-000000000000', 'aaaa0001-0000-0000-0000-000000000000', 'Wire up auth flow',              'Implement email + Google SSO sign-in, session handling, and the forgot-password flow. Hand off to onboarding once tokens are issued.', '55555555-5555-5555-5555-555555555555', 'high',   'In Progress', '2026-06-08', false, '2026-05-26 08:00:00+00'),
  ('bbbb0008-0000-0000-0000-000000000000', 'aaaa0001-0000-0000-0000-000000000000', 'Command palette polish',         'Tighten ⌘K result grouping, keyboard navigation, and empty-state copy across the workspace.','22222222-2222-2222-2222-222222222222', 'medium', 'In Progress', '2026-06-07', false, '2026-05-27 09:00:00+00'),
  ('bbbb0009-0000-0000-0000-000000000000', 'aaaa0001-0000-0000-0000-000000000000', 'Kanban drag performance',        'Reduce reflow on drag and large boards. Target 60fps when moving cards between columns.',     '44444444-4444-4444-4444-444444444444', 'medium', 'In Progress', '2026-06-11', false, '2026-05-28 10:00:00+00'),
  ('bbbb0010-0000-0000-0000-000000000000', 'aaaa0001-0000-0000-0000-000000000000', 'Role-based permissions',         'Enforce Admin vs Member capabilities across projects, the board, and the team page. Gate create, assign, and remove actions.', '33333333-3333-3333-3333-333333333333', 'high',   'Review',      '2026-06-06', false, '2026-05-15 08:00:00+00'),
  ('bbbb0011-0000-0000-0000-000000000000', 'aaaa0001-0000-0000-0000-000000000000', 'Activity feed pagination',       'Add cursor-based pagination to the activity feed so large projects load fast.',               '22222222-2222-2222-2222-222222222222', 'low',    'Review',      '2026-06-05', false, '2026-05-16 09:00:00+00'),
  ('bbbb0012-0000-0000-0000-000000000000', 'aaaa0001-0000-0000-0000-000000000000', 'Design empty states',            'First pass at empty states for projects, tasks, and team views.',                             '33333333-3333-3333-3333-333333333333', 'medium', 'Done',        '2026-06-02', false, '2026-05-10 08:00:00+00'),
  ('bbbb0013-0000-0000-0000-000000000000', 'aaaa0001-0000-0000-0000-000000000000', 'Sidebar navigation',             'Build the persistent sidebar with nav items, role toggle, and user row.',                    '55555555-5555-5555-5555-555555555555', 'medium', 'Done',        '2026-05-30', false, '2026-05-08 08:00:00+00'),
  ('bbbb0014-0000-0000-0000-000000000000', 'aaaa0001-0000-0000-0000-000000000000', 'Project cards layout',           'Design and build the project grid with progress bars, status badges, and avatar stacks.',    '22222222-2222-2222-2222-222222222222', 'low',    'Done',        '2026-05-28', false, '2026-05-06 08:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- Task dependency: Role-based permissions blocked by Wire up auth flow
INSERT INTO task_dependencies (task_id, depends_on_task_id) VALUES
  ('bbbb0010-0000-0000-0000-000000000000', 'bbbb0007-0000-0000-0000-000000000000')
ON CONFLICT DO NOTHING;

-- Atlas Migration tasks
INSERT INTO tasks (id, project_id, title, description, assignee_id, priority, status, due_date, ai_suggested, created_at) VALUES
  ('cccc0001-0000-0000-0000-000000000000', 'aaaa0002-0000-0000-0000-000000000000', 'Migrate billing tables',   'Move billing schema from monolith to new Postgres cluster. Requires zero-downtime migration strategy.', '44444444-4444-4444-4444-444444444444', 'high',   'Blocked',     '2026-05-28', false, '2026-04-20 08:00:00+00'),
  ('cccc0002-0000-0000-0000-000000000000', 'aaaa0002-0000-0000-0000-000000000000', 'Identity service spike',   'Evaluate Auth0 vs Clerk vs custom identity service for the new architecture.',                  '22222222-2222-2222-2222-222222222222', 'high',   'In Progress', '2026-06-01', false, '2026-04-22 09:00:00+00'),
  ('cccc0003-0000-0000-0000-000000000000', 'aaaa0002-0000-0000-0000-000000000000', 'Write migration runbook',  'Document the step-by-step cutover plan including rollback procedures.',                       '55555555-5555-5555-5555-555555555555', 'medium', 'Todo',        '2026-06-03', false, '2026-04-25 10:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- Pulse Analytics tasks
INSERT INTO tasks (id, project_id, title, description, assignee_id, priority, status, due_date, ai_suggested, created_at) VALUES
  ('dddd0001-0000-0000-0000-000000000000', 'aaaa0003-0000-0000-0000-000000000000', 'Dashboard widget library', 'Build reusable chart components: line, bar, funnel, and sparkline.',                          '33333333-3333-3333-3333-333333333333', 'high',   'In Progress', '2026-06-15', false, '2026-05-12 08:00:00+00'),
  ('dddd0002-0000-0000-0000-000000000000', 'aaaa0003-0000-0000-0000-000000000000', 'Shareable report links',   'Generate time-limited public URLs for dashboard snapshots.',                                   '22222222-2222-2222-2222-222222222222', 'medium', 'Todo',        '2026-06-20', false, '2026-05-14 09:00:00+00'),
  ('dddd0003-0000-0000-0000-000000000000', 'aaaa0003-0000-0000-0000-000000000000', 'Real-time data pipeline',  'Stream event data from Kafka into the analytics database with < 2s latency.',                '33333333-3333-3333-3333-333333333333', 'high',   'Done',        '2026-06-10', true,  '2026-05-10 08:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- Tasks for Shahil, Lena, Tomás, Mei, Jordan
INSERT INTO tasks (project_id, title, assignee_id, priority, status, due_date, created_at) VALUES
  ('aaaa0001-0000-0000-0000-000000000000', 'Define Q3 product roadmap',      '11111111-1111-1111-1111-111111111111', 'high',   'In Progress', '2026-06-15', NOW() - INTERVAL '3 days'),
  ('aaaa0002-0000-0000-0000-000000000000', 'Review infrastructure costs',    '11111111-1111-1111-1111-111111111111', 'medium', 'Todo',        '2026-06-18', NOW() - INTERVAL '2 days'),
  ('aaaa0003-0000-0000-0000-000000000000', 'Approve design system tokens',   '11111111-1111-1111-1111-111111111111', 'medium', 'Review',      '2026-06-10', NOW() - INTERVAL '1 day'),
  ('aaaa0004-0000-0000-0000-000000000000', 'Unblock Orbit Mobile team',      '11111111-1111-1111-1111-111111111111', 'high',   'Todo',        '2026-06-08', NOW() - INTERVAL '4 days'),
  ('aaaa0005-0000-0000-0000-000000000000', 'Write investor update',          '11111111-1111-1111-1111-111111111111', 'low',    'Backlog',     '2026-06-25', NOW() - INTERVAL '5 days'),
  ('aaaa0006-0000-0000-0000-000000000000', 'Sync with Harbor API partners',  '11111111-1111-1111-1111-111111111111', 'medium', 'Backlog',     '2026-06-20', NOW() - INTERVAL '6 days'),
  ('aaaa0005-0000-0000-0000-000000000000', 'Write onboarding checklist copy','66666666-6666-6666-6666-666666666666', 'medium', 'In Progress', '2026-06-14', NOW() - INTERVAL '2 days'),
  ('aaaa0005-0000-0000-0000-000000000000', 'Design welcome email template',  '66666666-6666-6666-6666-666666666666', 'low',    'Todo',        '2026-06-18', NOW() - INTERVAL '3 days'),
  ('aaaa0002-0000-0000-0000-000000000000', 'Document migration runbook',     '66666666-6666-6666-6666-666666666666', 'high',   'Review',      '2026-06-07', NOW() - INTERVAL '4 days'),
  ('aaaa0005-0000-0000-0000-000000000000', 'QA first-run experience flow',   '66666666-6666-6666-6666-666666666666', 'medium', 'Backlog',     '2026-06-22', NOW() - INTERVAL '5 days'),
  ('aaaa0006-0000-0000-0000-000000000000', 'Build API key rotation endpoint','77777777-7777-7777-7777-777777777777', 'high',   'In Progress', '2026-06-10', NOW() - INTERVAL '2 days'),
  ('aaaa0006-0000-0000-0000-000000000000', 'Rate limiter implementation',    '77777777-7777-7777-7777-777777777777', 'high',   'Todo',        '2026-06-12', NOW() - INTERVAL '3 days'),
  ('aaaa0002-0000-0000-0000-000000000000', 'Set up staging environment',     '77777777-7777-7777-7777-777777777777', 'medium', 'Done',        '2026-06-01', NOW() - INTERVAL '10 days'),
  ('aaaa0006-0000-0000-0000-000000000000', 'Write API reference docs',       '77777777-7777-7777-7777-777777777777', 'medium', 'Backlog',     '2026-06-25', NOW() - INTERVAL '4 days'),
  ('aaaa0006-0000-0000-0000-000000000000', 'Design webhook event schema',    '77777777-7777-7777-7777-777777777777', 'low',    'Backlog',     '2026-06-28', NOW() - INTERVAL '5 days'),
  ('aaaa0006-0000-0000-0000-000000000000', 'Add HMAC signature validation',  '77777777-7777-7777-7777-777777777777', 'high',   'Review',      '2026-06-09', NOW() - INTERVAL '1 day'),
  ('aaaa0004-0000-0000-0000-000000000000', 'iOS offline sync prototype',     '88888888-8888-8888-8888-888888888888', 'high',   'In Progress', '2026-06-15', NOW() - INTERVAL '3 days'),
  ('aaaa0004-0000-0000-0000-000000000000', 'Android push notifications',     '88888888-8888-8888-8888-888888888888', 'medium', 'Todo',        '2026-06-20', NOW() - INTERVAL '4 days'),
  ('aaaa0004-0000-0000-0000-000000000000', 'Design mobile nav patterns',     '88888888-8888-8888-8888-888888888888', 'low',    'Backlog',     '2026-06-25', NOW() - INTERVAL '5 days'),
  ('aaaa0003-0000-0000-0000-000000000000', 'Build usage chart widgets',      '99999999-9999-9999-9999-999999999999', 'high',   'In Progress', '2026-06-12', NOW() - INTERVAL '2 days'),
  ('aaaa0006-0000-0000-0000-000000000000', 'Create API playground UI',       '99999999-9999-9999-9999-999999999999', 'medium', 'Todo',        '2026-06-18', NOW() - INTERVAL '3 days'),
  ('aaaa0001-0000-0000-0000-000000000000', 'Analytics event tracking spec',  '99999999-9999-9999-9999-999999999999', 'low',    'Backlog',     '2026-06-22', NOW() - INTERVAL '4 days'),
  ('aaaa0003-0000-0000-0000-000000000000', 'Funnel chart component',         '99999999-9999-9999-9999-999999999999', 'medium', 'Review',      '2026-06-10', NOW() - INTERVAL '1 day'),
  ('aaaa0003-0000-0000-0000-000000000000', 'Export to CSV feature',          '99999999-9999-9999-9999-999999999999', 'low',    'Todo',        '2026-06-20', NOW() - INTERVAL '5 days')
ON CONFLICT DO NOTHING;

-- Activity log
INSERT INTO activity_log (project_id, user_id, action, entity_type, entity_id, created_at) VALUES
  ('aaaa0002-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444', 'moved "Migrate billing tables" to Blocked',  'task',    'cccc0001-0000-0000-0000-000000000000', NOW() - INTERVAL '12 minutes'),
  ('aaaa0001-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'completed "Design empty states"',             'task',    'bbbb0012-0000-0000-0000-000000000000', NOW() - INTERVAL '1 hour'),
  ('aaaa0003-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'created project "Pulse Analytics"',           'project', 'aaaa0003-0000-0000-0000-000000000000', NOW() - INTERVAL '3 hours'),
  ('aaaa0001-0000-0000-0000-000000000000', '55555555-5555-5555-5555-555555555555', 'commented on "Wire up auth flow"',             'task',    'bbbb0007-0000-0000-0000-000000000000', NOW() - INTERVAL '5 hours'),
  ('aaaa0001-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'raised priority of "Fix onboarding crash" to High', 'task', 'bbbb0004-0000-0000-0000-000000000000', NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;
