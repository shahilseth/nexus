import { Router, Response } from "express";
import pool from "../db";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

router.get("/", async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const isAdmin = req.user!.role === "admin";

  try {
    // Project scope: admin sees all, member sees their own
    const projectScope = isAdmin
      ? `SELECT id FROM projects`
      : `SELECT p.id FROM projects p JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = '${userId}'`;

    const result = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM (${projectScope}) ps) AS project_count,

        (SELECT COUNT(*) FROM tasks t
         WHERE t.project_id IN (${projectScope})
           AND t.due_date = CURRENT_DATE
           AND t.status != 'Done') AS tasks_due_today,

        (SELECT COUNT(*) FROM tasks t
         WHERE t.project_id IN (${projectScope})
           AND t.due_date < CURRENT_DATE
           AND t.status != 'Done') AS overdue_tasks,

        (SELECT COUNT(*) FROM users) AS member_count,

        (SELECT COUNT(*) FROM users u
         WHERE (SELECT COUNT(*) FROM tasks t WHERE t.assignee_id = u.id) >= 9
        ) AS members_at_capacity,

        (SELECT COUNT(*) FROM projects p
         WHERE p.created_at >= NOW() - INTERVAL '7 days') AS projects_added_this_week
    `);

    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
