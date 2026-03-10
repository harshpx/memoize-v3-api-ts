import {
  pgTable,
  index,
  unique,
  check,
  uuid,
  varchar,
  timestamp,
  foreignKey,
  text,
  boolean,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable(
  "users",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    avatarUrl: varchar("avatar_url", { length: 255 }),
    createdAt: timestamp("created_at", { precision: 6, mode: "string" }).notNull(),
    email: varchar({ length: 100 }).notNull(),
    name: varchar({ length: 100 }).notNull(),
    password: varchar({ length: 255 }),
    role: varchar({ length: 10 }).notNull(),
    updatedAt: timestamp("updated_at", { precision: 6, mode: "string" }).notNull(),
    username: varchar({ length: 50 }).notNull(),
    authSource: varchar("auth_source", { length: 20 }).notNull(),
  },
  (table) => [
    index("idx_user_email").using("btree", table.email.asc().nullsLast().op("text_ops")),
    index("idx_user_id").using("btree", table.id.asc().nullsLast().op("uuid_ops")),
    index("idx_user_username").using("btree", table.username.asc().nullsLast().op("text_ops")),
    unique("uk6dotkott2kjsp8vw4d0m25fb7").on(table.email),
    unique("ukr43af9ap4edm43mmtq01oddj6").on(table.username),
    check(
      "users_auth_source_check",
      sql`(auth_source)::text = ANY (ARRAY[('EMAIL'::character varying)::text, ('GOOGLE'::character varying)::text])`,
    ),
    check(
      "users_role_check",
      sql`(role)::text = ANY (ARRAY[('ADMIN'::character varying)::text, ('MOD'::character varying)::text, ('USER'::character varying)::text, ('OTHER'::character varying)::text])`,
    ),
  ],
);

export const notes = pgTable(
  "notes",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    content: text().notNull(),
    createdAt: timestamp("created_at", { precision: 6, mode: "string" }).notNull(),
    preview: text().notNull(),
    updatedAt: timestamp("updated_at", { precision: 6, mode: "string" }).notNull(),
    userId: uuid("user_id").defaultRandom().notNull(),
    isDeleted: boolean("is_deleted").default(false),
    isArchived: boolean("is_archived").default(false),
    deletedAt: timestamp("deleted_at", { precision: 6, mode: "string" }),
  },
  (table) => [
    index("idx_note_id").using("btree", table.id.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "fk_notes_user",
    }).onDelete("cascade"),
  ],
);

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    email: varchar({ length: 255 }).notNull(),
    expiresAt: timestamp("expires_at", { precision: 6, mode: "string" }).notNull(),
    token: varchar({ length: 255 }).notNull(),
  },
  (table) => [unique("uk6q9nsb665s9f8qajm3j07kd1e").on(table.token)],
);

export const refreshTokens = pgTable("refresh_tokens", {
  tokenId: uuid("token_id").defaultRandom().primaryKey().notNull(),
  expiresAt: timestamp("expires_at", { precision: 6, mode: "string" }).notNull(),
  tokenHash: varchar("token_hash", { length: 255 }).notNull(),
  userId: uuid("user_id").notNull(),
});
