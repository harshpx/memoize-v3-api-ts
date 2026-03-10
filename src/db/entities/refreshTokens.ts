import type { InferSelectModel } from "drizzle-orm";
import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const refreshTokens = pgTable("refresh_tokens", {
  tokenId: uuid("token_id").defaultRandom().primaryKey().notNull(),
  expiresAt: timestamp("expires_at", { precision: 6, mode: "date" }).notNull(),
  tokenHash: varchar("token_hash", { length: 255 }).notNull(),
  userId: uuid("user_id").notNull(),
});

export type RefreshToken = InferSelectModel<typeof refreshTokens>;
