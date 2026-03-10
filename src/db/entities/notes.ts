import { pgTable, uuid, timestamp, index, foreignKey, text, boolean } from "drizzle-orm/pg-core";
import { users } from "@/db/entities/users";
import { relations } from "drizzle-orm";

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

export const notesRelations = relations(notes, ({ one }) => ({
  user: one(users, {
    fields: [notes.userId],
    references: [users.id],
  }),
}));
