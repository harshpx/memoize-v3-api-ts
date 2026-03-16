import { AppError } from "@/utils/errors";
import { errorResponse } from "@/utils/common";
import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export const errorHandler = (err: Error, c: Context) => {
  let errorName: string = "InternalServerError";
  let errorMessage: string = "An unexpected error occurred";
  let statusCode: ContentfulStatusCode = 500;

  // Inbuilt library errors
  if (err.name.startsWith("Jwt")) {
    errorName = err.name;
    errorMessage = "Access Token expired or invalid";
    statusCode = 401;
  }
  // to add more lib errors ...

  // Custom application errors
  if (err instanceof AppError) {
    errorName = err.name;
    errorMessage = err.message;
    statusCode = err.getStatusCode();
  }

  console.error(`[ERROR][${errorName}]: ${errorMessage}`);
  return c.json(errorResponse(`[${errorName}]: ${errorMessage}`), statusCode);
};
