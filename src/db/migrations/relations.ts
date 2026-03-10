import { relations } from "drizzle-orm/relations";
import { users, notes } from "./schema";

export const notesRelations = relations(notes, ({ one }) => ({
  user: one(users, {
    fields: [notes.userId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  notes: many(notes),
}));
