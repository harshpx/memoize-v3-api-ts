import type { CookieOptions } from "hono/utils/cookie";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: Date;
}

export interface ErrorResponse extends ApiResponse<string> {
  success: false;
}

export interface AuthResponse {
  accessToken?: string;
  refreshToken?: string;
  userId?: string;
  role?: string;
}

export interface Cookie {
  name: string;
  value: string;
  opt?: CookieOptions;
}
