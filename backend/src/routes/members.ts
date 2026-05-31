import { Router, Response } from "express";
import pool from "../db";
import { requireAuth, requireAdmin, AuthRequest } from "../middleware/auth";
import { createNotification } from "../db/notify";

const router = Router();
router.use(requireAuth);

router.get("/", async (req: AuthRequest, res: Response) => {
  const { projectId } = req.query;
  try {
    let result;
    if (projectId) {
      // Include explicit members AND users assigned to tasks in this project
      result = await pool.query(
        `SELECT
          COALESCE(pm.id::text, '') as id,
          u.id as user_id,
          u.name,
          u.email,
          COALESCE(pm.role, 'member') as role,
          pm.joined_at,
          (SELECT COUNT(*) FROM tasks t WHERE t.assignee_id = u.id AND t.project_id = $1) as task_count
         FROM users u
         LEFT JOIN project_members pm ON pm.user_id = u.id AND pm.project_id = $1
         WHERE pm.project_id = $1
            OR u.id IN (
              SELECT DISTINCT assignee_id FROM tasks
              WHERE project_id = $1 AND assignee_id IS NOT NULL
            )
         ORDER BY u.name`,
        [projectId]
      );
    } else {
      result = await pool.query(
        `SELECT
          u.id, u.name, u.email, u.created_at,
          (SELECT COUNT(*) FROM tasks t WHERE t.assignee_id = u.id) as task_count,
          LEAST(CAST((SELECT COUNT(*) FROM tasks t WHERE t.assignee_id = u.id) * 11 AS INTEGER), 100) as workload_pct,
          CASE
            WHEN (SELECT COUNT(*) FROM tasks t WHERE t.assignee_id = u.id) >= 9 THEN 'At capacity'
            WHEN (SELECT COUNT(*) FROM tasks t WHERE t.assignee_id = u.id) >= 7 THEN 'Busy'
            WHEN (SELECT COUNT(*) FROM tasks t WHERE t.assignee_id = u.id) >= 4 THEN 'Balanced'
            ELSE 'Light'
          END as workload_label,
          COALESCE(
            (SELECT pm.role FROM project_members pm WHERE pm.user_id = u.id AND pm.role = 'admin' LIMIT 1),
            'member'
          ) as role,
          (SELECT MIN(pm.joined_at) FROM project_members pm WHERE pm.user_id = u.id) as joined_at
         FROM users u ORDER BY u.created_at`
      );
    }
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/invite", requireAdmin, async (req: AuthRequest, res: Response) => {
  const { project_id, email, role } = req.body;
  if (!project_id || !email) return res.status(400).json({ error: "project_id and email are required" });
  try {
    const userRes = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: "User not found" });
    const userId = userRes.rows[0].id;
    const existing = await pool.query(
      "SELECT id FROM project_members WHERE project_id = $1 AND user_id = $2",
      [project_id, userId]
    );
    if (existing.rows.length > 0) return res.status(409).json({ error: "Already a member" });
    const result = await pool.query(
      "INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3) RETURNING *",
      [project_id, userId, role || "member"]
    );
    await pool.query(
      "INSERT INTO activity_log (project_id, user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4, $5)",
      [project_id, req.user!.id, `invited member`, "member", userId]
    );
    const projRes = await pool.query("SELECT name FROM projects WHERE id = $1", [project_id]);
    const projName = projRes.rows[0]?.name || "a project";
    if (userId !== req.user!.id) {
      await createNotification(userId, `You were added to "${projName}"`, "member_added");
    }
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", requireAdmin, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { projectId } = req.query;
  try {
    if (projectId) {
      await pool.query(
        "DELETE FROM project_members WHERE user_id = $1 AND project_id = $2",
        [id, projectId]
      );
    } else {
      await pool.query("DELETE FROM project_members WHERE user_id = $1", [id]);
    }
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
