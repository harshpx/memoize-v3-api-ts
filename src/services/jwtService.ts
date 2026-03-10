import type { Role } from "@/utils/enums";
import { JwtSignError, MissingEnvVarError } from "@/utils/errors";
import { sign } from "hono/jwt";

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new MissingEnvVarError("JWT_SECRET");
}

export const jwtService = {
  generateUserAccessToken: async (userId: string, userRole: Role): Promise<string> => {
    const accessToken = await sign(
      {
        sub: userId,
        role: userRole,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 10, // 10 mins
      },
      jwtSecret,
    );

    if (!accessToken) {
      throw new JwtSignError("Failed to generate access token");
    }

    return accessToken;
  },
};
