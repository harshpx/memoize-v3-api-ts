import type { InferSelectModel } from "drizzle-orm";
import { pgTable, timestamp, unique, uuid, varchar } from "drizzle-orm/pg-core";

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    email: varchar({ length: 255 }).notNull(),
    expiresAt: timestamp("expires_at", { precision: 6, mode: "date" }).notNull(),
    token: varchar({ length: 255 }).notNull(),
  },
  (table) => [unique("uk6q9nsb665s9f8qajm3j07kd1e").on(table.token)],
);

export type VerificationToken = InferSelectModel<typeof verificationTokens>;
