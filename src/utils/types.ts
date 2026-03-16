import type { CookieOptions } from "hono/utils/cookie";
import type { Role } from "./enums";
import type { Env } from "hono";

export interface AppEnv extends Env {
  Variables: {
    userId?: string;
    userRole?: Role;
  };
}

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

export interface UserInfo {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl?: string;
  role: Role;
}

export interface AccessTokenData {
  userId: string;
  role: Role;
}

export interface Page<T> {
  content: T[]; // content
  empty: boolean; // is page empty
  first: boolean; // is first page
  last: boolean; // is last page
  number: number; // page number
  numberOfElements: number; // number of elements inside
  size: number; // max size per page
  totalElements: number; // total number of elements
  totalPages: number; // total number of pages
}

export interface PageRequest {
  pageNumber?: number;
  pageSize?: number;
  deleted?: boolean;
  archived?: boolean;
}

export interface Note {
  id: string;
  content: string;
  preview: string;
  createdAt: Date;
  updatedAt: Date;
  isArchived?: boolean | null;
  isDeleted?: boolean | null;
  deletedAt?: Date | null;
}
