import { Router, Response } from "express";
import pool from "../db";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

router.get("/", async (req: AuthRequest, res: Response) => {
  const { projectId } = req.query;
  try {
    let result;
    if (projectId) {
      result = await pool.query(
        `SELECT al.*, u.name as user_name FROM activity_log al
         JOIN users u ON u.id = al.user_id
         WHERE al.project_id = $1
         ORDER BY al.created_at DESC LIMIT 50`,
        [projectId]
      );
    } else {
      result = await pool.query(
        `SELECT al.*, u.name as user_name, p.name as project_name FROM activity_log al
         JOIN users u ON u.id = al.user_id
         LEFT JOIN projects p ON p.id = al.project_id
         ORDER BY al.created_at DESC LIMIT 50`
      );
    }
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
