import { Router, Response } from "express";
import pool from "../db";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

router.get("/", async (req: AuthRequest, res: Response) => {
  const { projectId } = req.query;
  if (!projectId) return res.status(400).json({ error: "projectId is required" });
  try {
    const result = await pool.query(
      `SELECT t.*, u.name as assignee_name FROM tasks t
       LEFT JOIN users u ON u.id = t.assignee_id
       WHERE t.project_id = $1
       ORDER BY t.created_at`,
      [projectId]
    );
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

async function ensureMember(projectId: string, userId: string) {
  const existing = await pool.query(
    "SELECT id FROM project_members WHERE project_id = $1 AND user_id = $2",
    [projectId, userId]
  );
  if (existing.rows.length === 0) {
    await pool.query(
      "INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, 'member')",
      [projectId, userId]
    );
  }
}

router.post("/", async (req: AuthRequest, res: Response) => {
  if (req.user!.role !== "admin") {
    return res.status(403).json({ error: "Admin only" });
  }
  const { project_id, title, description, assignee_id, priority, status, due_date, ai_suggested } = req.body;
  if (!project_id || !title) return res.status(400).json({ error: "project_id and title are required" });
  try {
    const result = await pool.query(
      `INSERT INTO tasks (project_id, title, description, assignee_id, priority, status, due_date, ai_suggested)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [project_id, title, description || null, assignee_id || null, priority || "medium", status || "Backlog", due_date || null, ai_suggested || false]
    );
    const task = result.rows[0];
    if (assignee_id) await ensureMember(project_id, assignee_id);
    await pool.query(
      "INSERT INTO activity_log (project_id, user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4, $5)",
      [project_id, req.user!.id, `created task "${title}"`, "task", task.id]
    );
    return res.status(201).json(task);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.put("/:id", async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const isAdmin = req.user!.role === "admin";
  try {
    const existing = await pool.query("SELECT * FROM tasks WHERE id = $1", [id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: "Not found" });
    const task = existing.rows[0];

    // Members can only update status of their own tasks
    if (!isAdmin) {
      if (task.assignee_id !== userId) {
        return res.status(403).json({ error: "You can only update your own tasks" });
      }
      const { status } = req.body;
      const result = await pool.query(
        "UPDATE tasks SET status = COALESCE($1, status) WHERE id = $2 RETURNING *",
        [status, id]
      );
      await pool.query(
        "INSERT INTO activity_log (project_id, user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4, $5)",
        [task.project_id, userId, `moved "${task.title}" to ${status}`, "task", id]
      );
      return res.json(result.rows[0]);
    }

    // Admin can update all fields
    const { title, description, assignee_id, priority, status, due_date, ai_suggested } = req.body;
    const result = await pool.query(
      `UPDATE tasks SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        assignee_id = COALESCE($3, assignee_id),
        priority = COALESCE($4, priority),
        status = COALESCE($5, status),
        due_date = COALESCE($6, due_date),
        ai_suggested = COALESCE($7, ai_suggested)
       WHERE id = $8 RETURNING *`,
      [title, description, assignee_id, priority, status, due_date, ai_suggested, id]
    );
    if (assignee_id) await ensureMember(task.project_id, assignee_id);
    await pool.query(
      "INSERT INTO activity_log (project_id, user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4, $5)",
      [task.project_id, userId, `updated "${task.title}"`, "task", id]
    );
    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", async (req: AuthRequest, res: Response) => {
  if (req.user!.role !== "admin") {
    return res.status(403).json({ error: "Admin only" });
  }
  const { id } = req.params;
  try {
    const task = await pool.query("SELECT * FROM tasks WHERE id = $1", [id]);
    if (task.rows.length === 0) return res.status(404).json({ error: "Not found" });
    await pool.query("DELETE FROM tasks WHERE id = $1", [id]);
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
