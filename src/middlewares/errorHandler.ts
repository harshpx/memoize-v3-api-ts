import { AppError } from "@/utils/errors";
import { errorResponse } from "@/utils/common";
import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export const errorHandler = (err: Error, c: Context) => {
  console.error(`[ERROR][${err.name}]: ${err.message}`);

  let status: ContentfulStatusCode = 500;
  if (err instanceof AppError) {
    status = err.getStatusCode();
  }
  return c.json(errorResponse(err.message), status);
};
