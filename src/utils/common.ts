import bcrypt from "bcryptjs";
import type { ApiResponse, Cookie, ErrorResponse, Note, UserInfo } from "@/utils/types";
import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import type { NoteEntity, UserEntity } from "@/db/entities";
import { Role } from "./enums";
import { z } from "zod";

export const PUBLIC_PREFIXES = ["/health", "/auth"];
export const isPublicRoute = (path: string): boolean => {
  if (path === "/") return true;
  return PUBLIC_PREFIXES.some((prefix) => {
    return path === prefix || path.startsWith(`${prefix}/`);
  });
};

export const apiResponse = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data,
  timestamp: new Date(),
});

export const errorResponse = (errorMessage: string): ErrorResponse => ({
  success: false,
  data: errorMessage,
  timestamp: new Date(),
});

export const generateRandomString = (length: number): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);
  let result = "";
  for (const val of randomValues) {
    result += chars.charAt(val % chars.length);
  }
  return result;
};

export const hashString = async (rawString: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(rawString, salt);
};

export const verifyHash = async (rawString: string, hashedString: string): Promise<boolean> => {
  return await bcrypt.compare(rawString, hashedString);
};

export const applyCookie = (c: Context, cookie: Cookie) => {
  setCookie(c, cookie.name, cookie.value, cookie.opt);
};

export const isValidUUID = (str: string): boolean => {
  const uuidSchema = z.uuid();
  return uuidSchema.safeParse(str).success;
};

export const isValidRole = (str: string): str is Role => {
  return Object.values(Role).includes(str as Role);
};

export const userInfoFromEntity = (user: UserEntity): UserInfo => {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl as string | undefined,
    role: user.role as Role,
  };
};

export const noteFromEntity = (noteEntity: NoteEntity): Note => {
  return {
    id: noteEntity.id,
    content: noteEntity.content,
    createdAt: noteEntity.createdAt,
    updatedAt: noteEntity.updatedAt,
    preview: noteEntity.preview,
    isArchived: noteEntity.isArchived,
    isDeleted: noteEntity.isDeleted,
    deletedAt: noteEntity.deletedAt,
  };
};
