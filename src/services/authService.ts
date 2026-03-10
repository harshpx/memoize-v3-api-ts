import {
  AuthError,
  DbQueryError,
  IllegalArgumentError,
  IllegalStateError,
  NotFoundError,
} from "@/utils/errors";
import type { LoginRequest, SignupRequest } from "@/utils/schemas";
import { db } from "@/db/db";
import { jwtService } from "./jwtService";
import { generateRandomString, hashString, verifyHash } from "@/utils/common";
import type { AuthResponse } from "@/utils/types";
import { refreshTokenService } from "./refreshTokenService";
import { mailService } from "./mailService";
import { users, verificationTokens } from "@/db/entities";
import { eq } from "drizzle-orm";
import { AuthSource, Role } from "@/utils/enums";

export const authService = {
  /**
   *
   * @param {LoginRequest} loginRequest
   * @returns {Promise<AuthResponse>} { accessToken, refreshToken }
   */
  login: async (loginRequest: LoginRequest): Promise<AuthResponse> => {
    const user = await db.query.users.findFirst({
      where: (user, { eq, or }) =>
        or(eq(user.username, loginRequest.identifier), eq(user.email, loginRequest.identifier)),
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
    const accessToken = await jwtService.generateUserAccessToken(user.id, user.role as Role);
    const refreshToken = await refreshTokenService.generateRefreshToken(user.id);
    return { accessToken, refreshToken };
  },

  signup: async (signupRequest: SignupRequest): Promise<AuthResponse> => {
    const validCode = await authService.verifyCode(
      signupRequest.email,
      signupRequest.verificationCode,
    );
    if (!validCode) {
      throw new AuthError("Invalid or expired verification code");
    }

    const hashedPassword = await hashString(signupRequest.password);

    const [newUser] = await db
      .insert(users)
      .values({
        name: signupRequest.name,
        username: signupRequest.username,
        email: signupRequest.email,
        password: hashedPassword,
        authSource: AuthSource.EMAIL,
        role: Role.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (!newUser) {
      throw new DbQueryError("Failed to create user");
    }

    const accessToken = await jwtService.generateUserAccessToken(newUser.id, newUser.role as Role);
    const refreshToken = await refreshTokenService.generateRefreshToken(newUser.id);
    return { accessToken, refreshToken };
  },

  checkEmailAvailability: async (email: string): Promise<boolean> => {
    const existingUser = await db.query.users.findFirst({
      where: (user, { eq }) => eq(user.email, email),
    });
    if (existingUser) return false;
    return true;
  },

  checkUsernameAvailability: async (username: string): Promise<boolean> => {
    const existingUser = await db.query.users.findFirst({
      where: (user, { eq }) => eq(user.username, username),
    });
    if (existingUser) return false;
    return true;
  },

  sendVerificationEmail: async (email: string, newRegistration: boolean): Promise<void> => {
    const verificationCode = generateRandomString(6);

    const emailAvailable = await authService.checkEmailAvailability(email);

    if (newRegistration && !emailAvailable) {
      throw new IllegalArgumentError("Email already in use");
    } else if (!newRegistration && emailAvailable) {
      throw new NotFoundError("Email not found, no account associated with the provided email");
    }

    const tokenExists = !!(await db.query.verificationTokens.findFirst({
      where: (token, { eq, and, gt }) =>
        and(eq(token.email, email), gt(token.expiresAt, new Date())),
    }));

    if (tokenExists) {
      throw new IllegalStateError(
        "A valid verification token already exists for this email, try after 10 minutes",
      );
    }

    const [newVerificationToken] = await db
      .insert(verificationTokens)
      .values({
        email,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        token: verificationCode,
      })
      .returning();

    if (!newVerificationToken) {
      throw new DbQueryError("Failed to create verification token");
    }

    await mailService.sendVerificationEmail(email, verificationCode);
  },

  verifyCode: async (email: string, code: string): Promise<boolean> => {
    const existingToken = await db.query.verificationTokens.findFirst({
      where: (t, { eq, and }) => and(eq(t.email, email), eq(t.token, code)),
    });
    if (!existingToken) {
      return false;
    }
    if (existingToken.expiresAt < new Date()) {
      await db.delete(verificationTokens).where(eq(verificationTokens.id, existingToken.id));
      return false;
    }
    await db.delete(verificationTokens).where(eq(verificationTokens.id, existingToken.id));
    return true;
  },
};
