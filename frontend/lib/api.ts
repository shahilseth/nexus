import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("nexus-token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/api/auth/login", { email, password }),
  signup: (name: string, email: string, password: string) =>
    api.post("/api/auth/signup", { name, email, password }),
};

// Projects
export const projectsApi = {
  list: () => api.get("/api/projects"),
  get: (id: string) => api.get(`/api/projects/${id}`),
  create: (data: { name: string; description?: string; status?: string; due_date?: string }) =>
    api.post("/api/projects", data),
  update: (id: string, data: Partial<{ name: string; description: string; status: string; due_date: string }>) =>
    api.put(`/api/projects/${id}`, data),
  delete: (id: string) => api.delete(`/api/projects/${id}`),
};

// Tasks
export const tasksApi = {
  list: (projectId: string) => api.get(`/api/tasks?projectId=${projectId}`),
  create: (data: {
    project_id: string;
    title: string;
    description?: string;
    assignee_id?: string;
    priority?: string;
    status?: string;
    due_date?: string;
    ai_suggested?: boolean;
  }) => api.post("/api/tasks", data),
  update: (id: string, data: Partial<{ title: string; description: string; assignee_id: string; priority: string; status: string; due_date: string; ai_suggested: boolean }>) =>
    api.put(`/api/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/api/tasks/${id}`),
};

// Members
export const membersApi = {
  list: (projectId?: string) =>
    api.get(projectId ? `/api/members?projectId=${projectId}` : "/api/members"),
  invite: (project_id: string, email: string, role?: string) =>
    api.post("/api/members/invite", { project_id, email, role }),
  remove: (userId: string, projectId?: string) =>
    api.delete(projectId ? `/api/members/${userId}?projectId=${projectId}` : `/api/members/${userId}`),
};

// Activity
export const activityApi = {
  list: (projectId?: string) =>
    api.get(projectId ? `/api/activity?projectId=${projectId}` : "/api/activity"),
};

// Stats
export const statsApi = {
  get: () => api.get("/api/stats"),
};

export default api;
