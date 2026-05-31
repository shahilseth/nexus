import { Router, Response } from "express";
import pool from "../db";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

// Auto-create table on first load so existing deployments don't need a manual migration
pool.query(`
  CREATE TABLE IF NOT EXISTS notifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message     TEXT NOT NULL,
    type        TEXT NOT NULL DEFAULT 'info',
    read        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
  );
  CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
`).catch(console.error);

// GET /api/notifications — fetch for the logged-in user
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50",
      [req.user!.id]
    );
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/notifications/read — mark all as read for the logged-in user
router.put("/read", async (req: AuthRequest, res: Response) => {
  try {
    await pool.query(
      "UPDATE notifications SET read = TRUE WHERE user_id = $1 AND read = FALSE",
      [req.user!.id]
    );
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
