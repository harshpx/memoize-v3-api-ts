import { jwtService } from "@/services/jwtService";
import { isPublicRoute, isValidRole, isValidUUID } from "@/utils/common";
import { AuthError } from "@/utils/errors";
import type { AppEnv } from "@/utils/types";
import type { Context, Next } from "hono";

export const securityHandler = async (c: Context<AppEnv>, next: Next) => {
  const path = c.req.path;
  if (isPublicRoute(path)) {
    return await next();
  }
  const authHeader = c.req.header("Authorization");
  if (!authHeader) {
    throw new AuthError("Authorization header not provided");
  }
  if (!authHeader.startsWith("Bearer ") || authHeader.split(" ").length !== 2) {
    throw new AuthError("Invalid Authorization header format");
  }
  const token = authHeader.split(" ")[1];
  if (!token || !token.trim()) {
    throw new AuthError("No token provided in Authorization header");
  }
  const { userId, role } = await jwtService.verifyAndDecodeAccessToken(token);

  if (!isValidUUID(userId) || !isValidRole(role)) {
    throw new AuthError("Invalid data in token");
  }

  c.set("userId", userId);
  c.set("userRole", role);

  await next();
};
