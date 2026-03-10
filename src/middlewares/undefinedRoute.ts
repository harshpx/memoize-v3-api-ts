import { errorResponse } from "@/utils/common";
import type { Context } from "hono";

export const undefinedRouteHandler = (c: Context) => {
  return c.json(errorResponse("The requested route does not exist."), 404);
};
