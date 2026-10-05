import { ensureSchema } from "@/db/ensure";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/db";
import { songs } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { isPlaylistKey } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  await ensureSchema();
  const body = await req.json().catch(() => null);
  if (!body || !String(body.title || "").trim()) {
    return Response.json({ error: "Title is required" }, { status: 400 });
  }
  const playlist = isPlaylistKey(body.playlist) ? body.playlist : "durga_puja";
  const rows = await db
    .select({ p: songs.position })
    .from(songs)
    .where(eq(songs.playlist, playlist))
    .orderBy(desc(songs.position));
  const nextPos = (rows[0]?.p ?? 0) + 1;

  const [row] = await db
    .insert(songs)
    .values({
      title: String(body.title).trim(),
      artist: String(body.artist || "").trim(),
      duration: String(body.duration || "0:00"),
      audioUrl: body.audioUrl ? String(body.audioUrl) : null,
      youtubeUrl: body.youtubeUrl ? String(body.youtubeUrl) : null,
      coverUrl: body.coverUrl ? String(body.coverUrl) : null,
      playlist,
      position: nextPos,
    })
    .returning();

  return Response.json({ song: row }, { status: 201 });
}

export async function DELETE(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  await ensureSchema();
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!id) return Response.json({ error: "id required" }, { status: 400 });
  await db.delete(songs).where(eq(songs.id, id));
  return Response.json({ ok: true });
}
