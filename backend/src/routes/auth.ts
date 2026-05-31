import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

router.post("/signup", async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "name, email, and password are required" });
  }
  try {
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at",
      [name, email, hash]
    );
    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, role: "member" },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );
    return res.status(201).json({ token, user: { ...user, role: "member" } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }
  try {
    const userRow = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userRow.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const user = userRow.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const roleRes = await pool.query(
      "SELECT role FROM project_members WHERE user_id = $1 AND role = 'admin' LIMIT 1",
      [user.id]
    );
    const role = roleRes.rows.length > 0 ? "admin" : "member";
    const token = jwt.sign(
      { id: user.id, email: user.email, role },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );
    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role, created_at: user.created_at },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/auth/profile — update display name
router.put("/profile", requireAuth, async (req: AuthRequest, res: Response) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "name is required" });
  }
  try {
    const result = await pool.query(
      "UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email",
      [name.trim(), req.user!.id]
    );
    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/auth/password — change password
router.put("/password", requireAuth, async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "currentPassword and newPassword are required" });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: "New password must be at least 6 characters" });
  }
  try {
    const userRow = await pool.query("SELECT * FROM users WHERE id = $1", [req.user!.id]);
    const user = userRow.rows[0];
    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [hash, user.id]);
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
