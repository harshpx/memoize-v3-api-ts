import { db } from "@/db/db";
import { notes, users } from "@/db/entities";
import { noteFromEntity } from "@/utils/common";
import { DbQueryError, NotFoundError } from "@/utils/errors";
import type { NoteModifyRequest } from "@/utils/schemas";
import type { Note, Page, PageRequest } from "@/utils/types";
import { and, count, eq, sql } from "drizzle-orm";

export const notesService = {
  fetchNotesByUser: async (
    userId: string,
    { pageNumber = 0, pageSize = 50, deleted = false }: PageRequest,
  ): Promise<Page<Note>> => {
    const offset = pageNumber * pageSize;

    const dataPromise = await db
      .select()
      .from(notes)
      .where(and(eq(notes.userId, userId), eq(notes.isDeleted, deleted)))
      .limit(pageSize)
      .offset(offset);
    const countPromise = db
      .select({ value: count() })
      .from(notes)
      .where(and(eq(notes.userId, userId), eq(notes.isDeleted, deleted)));

    const [data, [countData]] = await Promise.all([dataPromise, countPromise]);

    const content = data.map((note) => noteFromEntity(note));
    const totalElements = countData?.value ?? data.length;
    const totalPages = Math.ceil(totalElements / pageSize);
    const numberOfElements = data.length;

    return {
      content,
      empty: numberOfElements === 0,
      first: pageNumber === 0,
      last: pageNumber >= totalPages - 1,
      number: pageNumber,
      numberOfElements: numberOfElements,
      size: pageSize,
      totalElements: totalElements,
      totalPages: totalPages,
    };
  },
  createNoteByUser: async (userId: string, request: NoteModifyRequest): Promise<Note> => {
    const result = await db
      .select({ exists: sql<boolean>`1` })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundError("User not found");
    }

    const [newNote] = await db
      .insert(notes)
      .values({
        content: request.content,
        preview: request.preview,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
        isDeleted: false,
        deletedAt: null,
      })
      .returning();

    if (!newNote) {
      throw new DbQueryError("Failed to create note");
    }

    return noteFromEntity(newNote);
  },
  updateNoteByUser: async (
    userId: string,
    noteId: string,
    request: NoteModifyRequest,
  ): Promise<Note> => {
    const result = await db
      .select({ exists: sql<boolean>`1` })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundError("User not found");
    }

    const [updatedNote] = await db
      .update(notes)
      .set({
        content: request.content,
        preview: request.preview,
        updatedAt: new Date(),
      })
      .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
      .returning();

    if (!updatedNote) {
      throw new NotFoundError("Note not found or user does not have permission to update");
    }

    return noteFromEntity(updatedNote);
  },
  deleteNoteByUser: async (userId: string, noteId: string): Promise<Note> => {
    const result = await db
      .select({ exists: sql<boolean>`1` })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundError("User not found");
    }

    const [deletedNote] = await db
      .update(notes)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
      })
      .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
      .returning();

    if (!deletedNote) {
      throw new NotFoundError("Note not found or user does not have permission to delete");
    }

    return noteFromEntity(deletedNote);
  },
  restoreNoteByUser: async (userId: string, noteId: string): Promise<Note> => {
    const result = await db
      .select({ exists: sql<boolean>`1` })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundError("User not found");
    }

    const [restoredNote] = await db
      .update(notes)
      .set({
        isDeleted: false,
        deletedAt: null,
      })
      .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
      .returning();

    if (!restoredNote) {
      throw new NotFoundError("Note not found or user does not have permission to restore");
    }

    return noteFromEntity(restoredNote);
  },
  permanentlyDeleteNoteByUser: async (userId: string, noteId: string): Promise<number> => {
    const result = await db
      .select({ exists: sql<boolean>`1` })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundError("User not found");
    }

    const deleteResult = await db
      .delete(notes)
      .where(and(eq(notes.id, noteId), eq(notes.userId, userId)));

    if (deleteResult.rowCount === 0) {
      throw new NotFoundError("Note not found or user does not have permission to delete");
    }

    return deleteResult.rowCount;
  },
};
