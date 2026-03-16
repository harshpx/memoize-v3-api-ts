import { validateRequest } from "@/middlewares/validateRequest";
import { notesService } from "@/services/notesService";
import { apiResponse } from "@/utils/common";
import { NoteModifySchema } from "@/utils/schemas";
import type { AppEnv } from "@/utils/types";
import { Hono } from "hono";

const notesRouter = new Hono<AppEnv>();

notesRouter.get("/", async (c) => {
  const userId = c.get("userId") as string;
  const deleted = c.req.query("deleted") === "true";
  const page = Number(c.req.query("page") || "0");
  const size = Number(c.req.query("size") || "50");

  const response = await notesService.fetchNotesByUser(userId, {
    pageNumber: page,
    pageSize: size,
    deleted,
  });

  return c.json(apiResponse(response));
});

notesRouter.post("/", validateRequest(NoteModifySchema), async (c) => {
  const userId = c.get("userId") as string;
  const request = c.req.valid("json");

  const response = await notesService.createNoteByUser(userId, request);

  return c.json(apiResponse(response));
});

notesRouter.put("/:id", validateRequest(NoteModifySchema), async (c) => {
  const userId = c.get("userId") as string;
  const noteId = c.req.param("id");
  const request = c.req.valid("json");

  const response = await notesService.updateNoteByUser(userId, noteId, request);

  return c.json(apiResponse(response));
});

notesRouter.delete("/:id", async (c) => {
  const userId = c.get("userId") as string;
  const noteId = c.req.param("id");

  const response = await notesService.deleteNoteByUser(userId, noteId);

  return c.json(apiResponse(response));
});

notesRouter.put("/:id/restore", async (c) => {
  const userId = c.get("userId") as string;
  const noteId = c.req.param("id");

  const response = await notesService.restoreNoteByUser(userId, noteId);

  return c.json(apiResponse(response));
});

notesRouter.delete("/:id/permanent", async (c) => {
  const userId = c.get("userId") as string;
  const noteId = c.req.param("id");

  const response = await notesService.permanentlyDeleteNoteByUser(userId, noteId);

  return c.json(apiResponse(response));
});

export default notesRouter;
