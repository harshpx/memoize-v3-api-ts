import { Hono } from "hono";
import { errorHandler } from "@/middlewares/errorHandler";
import { undefinedRouteHandler } from "./middlewares/undefinedRoute";
import { securityHandler } from "./middlewares/securityHandler";
import appRouter from "./routes";
import type { AppEnv } from "./utils/types";
import { corsHandler } from "./middlewares/corsHandler";

const app = new Hono<AppEnv>();

// cors
app.use("*", corsHandler);
// auth
app.use("*", securityHandler);
// routes
app.route("/", appRouter);
// error handling
app.onError(errorHandler);
app.notFound(undefinedRouteHandler);

export default app;
