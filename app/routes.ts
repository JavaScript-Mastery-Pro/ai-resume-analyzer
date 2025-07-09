import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/auth", "routes/auth.tsx"),
  route("/files", "routes/files.tsx"),
  route("/jobs/new", "routes/new-job.tsx"),
  route("/upload", "routes/upload.tsx"),
  route("/candidates", "routes/candidates.tsx"),
  route("/candidates/:id", "routes/candidate.tsx"),
] satisfies RouteConfig;
