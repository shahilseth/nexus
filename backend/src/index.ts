import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth";
import projectRoutes from "./routes/projects";
import taskRoutes from "./routes/tasks";
import memberRoutes from "./routes/members";
import activityRoutes from "./routes/activity";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
  .split(",")
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/activity", activityRoutes);

app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Nexus backend running on port ${PORT}`);
});
