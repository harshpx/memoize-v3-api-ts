import type { AppEnv } from "@/utils/types";
import { Hono } from "hono";
import healthRouter from "./healthRoute";
import authRouter from "./authRoute";
import userRouter from "./userRoute";
import notesRouter from "./notesRoute";

const appRouter = new Hono<AppEnv>();

appRouter.route("/", healthRouter);
appRouter.route("/auth", authRouter);
appRouter.route("/user", userRouter);
appRouter.route("/notes", notesRouter);

export default appRouter;
