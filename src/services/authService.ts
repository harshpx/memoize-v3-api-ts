import { users } from "@/db/entities";
import { AuthError } from "@/utils/errors";
import type { LoginSchema } from "@/utils/schemas";
import { eq, or } from "drizzle-orm";
import { db } from "@/db/db";
import { jwtService } from "./jwtService";
import { verifyHash } from "@/utils/common";
import type { AuthResponse } from "@/utils/types";
import { refreshTokenService } from "./refreshTokenService";

export const authService = {
  /**
   *
   * @param {LoginSchema} loginRequest
   * @returns {Promise<AuthResponse>} { accessToken, refreshToken }
   */
  login: async (loginRequest: LoginSchema): Promise<AuthResponse> => {
    const user = await db.query.users.findFirst({
      where: or(
        eq(users.username, loginRequest.identifier),
        eq(users.email, loginRequest.identifier),
      ),
    });
    if (!user || !user.password) {
      throw new AuthError("Invalid credentials, User not found with the provided username/email.");
    }
    const isPasswordValid = await verifyHash(loginRequest.password, user.password);
    if (!isPasswordValid) {
      throw new AuthError(
        "Invalid credentials, check you email/username and password combination.",
      );
    }
    const accessToken = await jwtService.generateUserAccessToken(user);
    const refreshToken = await refreshTokenService.generateRefreshToken(user.id);
    return { accessToken, refreshToken };
  },
};
