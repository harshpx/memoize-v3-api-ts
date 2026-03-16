import { cors } from "hono/cors";

export const corsHandler = cors({
  origin: ["http://localhost:5173", "https://www.memoize.in"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});
