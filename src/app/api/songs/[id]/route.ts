import { ensureSchema } from "@/db/ensure";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/db";
import { songs } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  await ensureSchema();
  const { id } = await ctx.params;
  const num = Number(id);
  if (!num) return Response.json({ error: "bad id" }, { status: 400 });
  const body = await req.json().catch(() => null);
  if (!body) return Response.json({ error: "bad body" }, { status: 400 });

  const patch: Record<string, unknown> = {};
  if (body.title !== undefined) patch.title = String(body.title).trim();
  if (body.artist !== undefined) patch.artist = String(body.artist).trim();
  if (body.duration !== undefined) patch.duration = String(body.duration);
  if (body.audioUrl !== undefined) patch.audioUrl = body.audioUrl ? String(body.audioUrl) : null;
  if (body.youtubeUrl !== undefined) patch.youtubeUrl = body.youtubeUrl ? String(body.youtubeUrl) : null;
  if (body.coverUrl !== undefined) patch.coverUrl = body.coverUrl ? String(body.coverUrl) : null;
  if (body.playlist !== undefined) patch.playlist = String(body.playlist);

  if (Object.keys(patch).length === 0) return Response.json({ error: "nothing to update" }, { status: 400 });

  const [row] = await db.update(songs).set(patch).where(eq(songs.id, num)).returning();
  if (!row) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json({ song: row });
}
