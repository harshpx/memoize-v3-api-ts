import { Hono } from "hono";
import { errorHandler } from "@/middlewares/errorHandler";
import healthRouter from "@/routes/healthRoute";
import { undefinedRouteHandler } from "./middlewares/undefinedRoute";
import authRouter from "@/routes/authRoute";

const app = new Hono();

app.route("/", healthRouter);
app.route("/auth", authRouter);
app.onError(errorHandler);
app.notFound(undefinedRouteHandler);

export default {
  port: Number(process.env.PORT) || 8086,
  fetch: app.fetch,
};
