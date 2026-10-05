import { ensureSchema } from "@/db/ensure";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/db";
import { creators } from "@/db/schema";
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
  if (body.name !== undefined) patch.name = String(body.name).trim();
  if (body.photoUrl !== undefined) patch.photoUrl = body.photoUrl ? String(body.photoUrl) : null;
  if (body.linkedin !== undefined) patch.linkedin = String(body.linkedin || "");
  if (body.instagram !== undefined) patch.instagram = String(body.instagram || "");

  if (Object.keys(patch).length === 0) return Response.json({ error: "nothing to update" }, { status: 400 });

  const [row] = await db.update(creators).set(patch).where(eq(creators.id, num)).returning();
  if (!row) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json({ creator: row });
}
