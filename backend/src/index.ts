import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth";
import projectRoutes from "./routes/projects";
import taskRoutes from "./routes/tasks";
import memberRoutes from "./routes/members";
import activityRoutes from "./routes/activity";
import statsRoutes from "./routes/stats";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    const allowed = (process.env.ALLOWED_ORIGINS || "*")
      .split(",")
      .map(o => o.trim());
    if (allowed.includes("*") || allowed.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/stats", statsRoutes);

app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Nexus backend running on port ${PORT}`);
});
