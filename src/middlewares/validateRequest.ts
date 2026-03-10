import { ValidationError } from "@/utils/errors";
import type { Env } from "hono";
import { createMiddleware } from "hono/factory";
import { z, type ZodObject } from "zod";

export const validateRequest = <T extends ZodObject>(schema: T) => {
  return createMiddleware<Env, string, { out: { json: z.infer<T> } }>(async (c, next) => {
    const body = await c.req.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      throw new ValidationError(result.error.issues.map((issue) => issue.message).join("; "));
    }

    c.req.addValidatedData("json", result.data);

    await next();
  });
};
