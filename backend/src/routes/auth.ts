import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db";

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
    const result = await pool.query(
      "SELECT u.id, u.name, u.email, u.password_hash, COALESCE(pm.role, 'member') as role FROM users u LEFT JOIN project_members pm ON pm.user_id = u.id LIMIT 1",
      []
    );
    const userRow = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userRow.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const user = userRow.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    // Determine role: if user is owner of any project or has admin role in project_members, treat as admin
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

export default router;
