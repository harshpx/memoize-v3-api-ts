import { pgTable, unique, uuid, varchar, timestamp, index, check } from "drizzle-orm/pg-core";
import { relations, sql, type InferSelectModel } from "drizzle-orm";
import { notes } from "@/db/entities/notes";

export const users = pgTable(
  "users",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    avatarUrl: varchar("avatar_url", { length: 255 }),
    createdAt: timestamp("created_at", { precision: 6, mode: "date" }).notNull(),
    email: varchar({ length: 100 }).notNull(),
    name: varchar({ length: 100 }).notNull(),
    password: varchar({ length: 255 }),
    role: varchar({ length: 10 }).notNull(),
    updatedAt: timestamp("updated_at", { precision: 6, mode: "date" }).notNull(),
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
      "users_role_check",
      sql`(role)::text = ANY ((ARRAY['ADMIN'::character varying, 'MOD'::character varying, 'USER'::character varying, 'OTHER'::character varying])::text[])`,
    ),
    check(
      "users_auth_source_check",
      sql`(auth_source)::text = ANY ((ARRAY['EMAIL'::character varying, 'GOOGLE'::character varying])::text[])`,
    ),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  notes: many(notes),
}));

export type User = InferSelectModel<typeof users>;
