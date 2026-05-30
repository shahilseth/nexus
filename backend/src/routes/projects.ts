import { Router, Response } from "express";
import pool from "../db";
import { requireAuth, requireAdmin, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    let result;
    const extraCols = `
      u.name as owner_name,
      (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) as task_count,
      (SELECT COUNT(*) FROM project_members pm WHERE pm.project_id = p.id) as member_count,
      -- Progress: % of tasks marked Done
      ROUND(
        CASE WHEN (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) = 0 THEN 0
        ELSE (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'Done')::FLOAT
             / (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) * 100
        END
      ) as progress,
      -- Last active: human-readable time since last activity
      (
        SELECT CASE
          WHEN EXTRACT(EPOCH FROM (NOW() - MAX(al.created_at)))/60 < 60
            THEN FLOOR(EXTRACT(EPOCH FROM (NOW() - MAX(al.created_at)))/60)::text || 'm ago'
          WHEN EXTRACT(EPOCH FROM (NOW() - MAX(al.created_at)))/3600 < 24
            THEN FLOOR(EXTRACT(EPOCH FROM (NOW() - MAX(al.created_at)))/3600)::text || 'h ago'
          WHEN EXTRACT(EPOCH FROM (NOW() - MAX(al.created_at)))/86400 < 2
            THEN 'Yesterday'
          ELSE FLOOR(EXTRACT(EPOCH FROM (NOW() - MAX(al.created_at)))/86400)::text || 'd ago'
        END
        FROM activity_log al WHERE al.project_id = p.id
      ) as last_active,
      -- Members: first 4 member names as JSON array
      (
        SELECT json_agg(json_build_object('name', u2.name))
        FROM (
          SELECT u2.name FROM project_members pm2
          JOIN users u2 ON u2.id = pm2.user_id
          WHERE pm2.project_id = p.id
          LIMIT 4
        ) u2
      ) as members`;

    if (role === "admin") {
      result = await pool.query(
        `SELECT p.*, ${extraCols}
         FROM projects p
         JOIN users u ON u.id = p.owner_id
         ORDER BY p.created_at DESC`
      );
    } else {
      result = await pool.query(
        `SELECT p.*, ${extraCols}
         FROM projects p
         JOIN users u ON u.id = p.owner_id
         JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = $1
         ORDER BY p.created_at DESC`,
        [userId]
      );
    }
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/", requireAdmin, async (req: AuthRequest, res: Response) => {
  const { name, description, status, due_date } = req.body;
  if (!name) return res.status(400).json({ error: "name is required" });
  try {
    const result = await pool.query(
      `INSERT INTO projects (name, description, status, owner_id, due_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, description || null, status || "On Track", req.user!.id, due_date || null]
    );
    const project = result.rows[0];
    await pool.query(
      "INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, 'admin')",
      [project.id, req.user!.id]
    );
    await pool.query(
      "INSERT INTO activity_log (project_id, user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4, $5)",
      [project.id, req.user!.id, "created project", "project", project.id]
    );
    return res.status(201).json(project);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id", async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const projectRes = await pool.query(
      `SELECT p.*, u.name as owner_name FROM projects p JOIN users u ON u.id = p.owner_id WHERE p.id = $1`,
      [id]
    );
    if (projectRes.rows.length === 0) return res.status(404).json({ error: "Not found" });
    const project = projectRes.rows[0];

    const membersRes = await pool.query(
      `SELECT pm.id, pm.role, pm.joined_at, u.id as user_id, u.name, u.email
       FROM project_members pm JOIN users u ON u.id = pm.user_id
       WHERE pm.project_id = $1`,
      [id]
    );
    const tasksRes = await pool.query(
      `SELECT t.*, u.name as assignee_name,
        (SELECT t2.title FROM task_dependencies td JOIN tasks t2 ON t2.id = td.depends_on_task_id WHERE td.task_id = t.id LIMIT 1) as blocked_by,
        (SELECT t3.title FROM task_dependencies td2 JOIN tasks t3 ON t3.id = td2.task_id WHERE td2.depends_on_task_id = t.id LIMIT 1) as blocks
       FROM tasks t
       LEFT JOIN users u ON u.id = t.assignee_id
       WHERE t.project_id = $1
       ORDER BY t.created_at`,
      [id]
    );
    const depsRes = await pool.query(
      `SELECT td.*, t1.title as task_title, t2.title as depends_on_title
       FROM task_dependencies td
       JOIN tasks t1 ON t1.id = td.task_id
       JOIN tasks t2 ON t2.id = td.depends_on_task_id
       WHERE t1.project_id = $1`,
      [id]
    );

    return res.json({
      ...project,
      members: membersRes.rows,
      tasks: tasksRes.rows,
      dependencies: depsRes.rows,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.put("/:id", requireAdmin, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, description, status, due_date } = req.body;
  try {
    const result = await pool.query(
      `UPDATE projects SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        status = COALESCE($3, status),
        due_date = COALESCE($4, due_date)
       WHERE id = $5 RETURNING *`,
      [name, description, status, due_date, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });
    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", requireAdmin, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM projects WHERE id = $1", [id]);
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
