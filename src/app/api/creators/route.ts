import { ensureSchema } from "@/db/ensure";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/db";
import { creators } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  await ensureSchema();
  const body = await req.json().catch(() => null);
  if (!body || !String(body.name || "").trim()) {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }
  const rows = await db.select({ p: creators.position }).from(creators).orderBy(desc(creators.position));
  const nextPos = (rows[0]?.p ?? 0) + 1;
  const [row] = await db
    .insert(creators)
    .values({
      name: String(body.name).trim(),
      photoUrl: body.photoUrl ? String(body.photoUrl) : null,
      linkedin: String(body.linkedin || ""),
      instagram: String(body.instagram || ""),
      position: nextPos,
    })
    .returning();
  return Response.json({ creator: row }, { status: 201 });
}

export async function DELETE(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  await ensureSchema();
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!id) return Response.json({ error: "id required" }, { status: 400 });
  await db.delete(creators).where(eq(creators.id, id));
  return Response.json({ ok: true });
}
