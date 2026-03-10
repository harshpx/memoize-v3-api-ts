import bcrypt from "bcryptjs";
import type { ApiResponse, Cookie, ErrorResponse } from "@/utils/types";
import type { Context } from "hono";
import { setCookie } from "hono/cookie";

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
