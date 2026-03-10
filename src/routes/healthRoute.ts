import { client } from "@/db/db";
import { apiResponse } from "@/utils/common";
import { DbConnectionError } from "@/utils/errors";
import { Hono } from "hono";

const healthRouter = new Hono();

healthRouter.get("/", (c) => {
  return c.json(
    apiResponse({
      message: "Memoize API is running & healthy!",
      upTime: process.uptime(),
    }),
  );
});

healthRouter.get("/health", async (c) => {
  try {
    await client`select 1`;
  } catch (error) {
    console.error("[ERROR]: Database health check failed: ", error);
    throw new DbConnectionError("Query failed, database connection might be unhealthy.");
  }
  return c.json(
    apiResponse({
      message: "Database connection is healthy!",
      upTime: process.uptime(),
    }),
  );
});

export default healthRouter;
