import { db } from "@/db/db";
import { refreshTokens, users, type RefreshToken } from "@/db/entities";
import { generateRandomString, hashString, verifyHash } from "@/utils/common";
import { AuthError, DbQueryError, IllegalArgumentError, NotProvidedError } from "@/utils/errors";
import { and, eq, gt } from "drizzle-orm";
import { jwtService } from "./jwtService";
import type { AuthResponse, Cookie } from "@/utils/types";
import type { Role } from "@/utils/enums";

const tokenExpiryDays = 10;

export const refreshTokenService = {
  /**
   *
   * @param {string} userId
   * @returns {Promise<string>}
   * @throws {DbQueryError}
   * @description Generates a new refresh token for the given user ID.
   */
  generateRefreshToken: async (userId: string): Promise<string> => {
    const secret = generateRandomString(64);
    const tokenHash = await hashString(secret);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + tokenExpiryDays);

    const [newRefreshToken] = await db
      .insert(refreshTokens)
      .values({ userId, tokenHash, expiresAt })
      .returning();

    if (!newRefreshToken) {
      throw new DbQueryError("Failed to create refresh token");
    }

    return newRefreshToken.tokenId + "." + secret;
  },

  /**
   *
   * @param {string} refreshTokenCookieString
   * @returns {Promise<AuthResponse>}
   * @throws {IllegalArgumentError | NotProvidedError | AuthError}
   * @description Validates the provided refresh token string and
   * generates a new access token and refresh token (token rotation & invalidation).
   */
  refreshAccessToken: async (refreshTokenCookieString: string): Promise<AuthResponse> => {
    const existingRefreshToken =
      await refreshTokenService.validateAndGetRefreshTokenEntity(refreshTokenCookieString);

    const userId = existingRefreshToken.userId;
    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!user) {
      throw new AuthError("User associated with the provided refresh token no longer exists");
    }
    const newAccessToken = await jwtService.generateUserAccessToken(user.id, user.role as Role);

    await db.delete(refreshTokens).where(eq(refreshTokens.tokenId, existingRefreshToken.tokenId));

    const newRefreshToken = await refreshTokenService.generateRefreshToken(userId);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  },

  /**
   *
   * @param {string} refreshToken
   * @returns {Cookie}
   * @description Creates a cookie object for the provided refresh token string,
   * with appropriate security settings and expiration time.
   */
  createRefreshTokenCookie: (refreshToken: string | undefined): Cookie => {
    if (!refreshToken) {
      throw new IllegalArgumentError("A valid refresh token is required to create the cookie");
    }
    return {
      name: "refreshToken",
      value: refreshToken,
      opt: {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/auth/refresh",
        maxAge: 24 * 60 * 60 * tokenExpiryDays,
      },
    };
  },

  /**
   *
   * @returns {Cookie}
   * @description Creates a cookie object that effectively deletes the refresh token cookie on the client
   * by setting an empty value and maxAge of 0.
   */
  deleteRefreshTokenCookie: (): Cookie => {
    return {
      name: "refreshToken",
      value: "",
      opt: {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 0,
      },
    };
  },

  // helper methods
  /**
   *
   * @param {string} token
   * @returns {Promise<RefreshToken>}
   * @throws {IllegalArgumentError | NotProvidedError | AuthError}
   * @description Validates the provided refresh token string and retrieves the corresponding refresh token entity from the database.
   */
  validateAndGetRefreshTokenEntity: async (token: string): Promise<RefreshToken> => {
    if (!token.trim()) {
      throw new NotProvidedError("A valid refresh token is required");
    }

    const parts: string[] = token.split(".");
    if (parts.length !== 2) {
      throw new IllegalArgumentError("Invalid refresh token format");
    }

    const [tokenId, rawSecret] = parts;

    if (!tokenId || !rawSecret) {
      throw new IllegalArgumentError("Invalid refresh token format");
    }

    const [refreshTokenEntity] = await db
      .select({ token: refreshTokens })
      .from(refreshTokens)
      .innerJoin(users, eq(refreshTokens.userId, users.id))
      .where(and(eq(refreshTokens.tokenId, tokenId), gt(refreshTokens.expiresAt, new Date())))
      .limit(1);

    if (!refreshTokenEntity) {
      throw new AuthError("Invalid/Expired refresh token provided");
    }

    const isValid = await verifyHash(rawSecret, refreshTokenEntity.token.tokenHash);
    if (!isValid) {
      throw new AuthError("Invalid refresh token provided");
    }

    return refreshTokenEntity.token;
  },

  /**
   *
   * @param {string} token
   * @returns {Promise<void>}
   * @description Deletes the refresh token associated with the provided token string from the database.
   */
  removeRefreshToken: async (token: string) => {
    if (!token.trim()) {
      console.warn("[WARN]: Attempted to remove refresh token with empty token string");
      return;
    }
    const parts: string[] = token.split(".");
    if (parts.length !== 2) {
      console.warn("[WARN]: Attempted to remove refresh token with invalid format");
      return;
    }
    const tokenId = parts[0];
    if (!tokenId || !tokenId.trim()) {
      console.warn("[WARN]: Attempted to remove refresh token with empty tokenId");
      return;
    }
    await db.delete(refreshTokens).where(eq(refreshTokens.tokenId, tokenId));
  },
};
