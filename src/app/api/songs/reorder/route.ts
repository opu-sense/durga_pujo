import { ensureSchema } from "@/db/ensure";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/db";
import { songs } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  await ensureSchema();
  const body = await req.json().catch(() => null);
  const ids: unknown = body?.ids;
  if (!Array.isArray(ids) || !ids.every((n) => Number.isInteger(n))) {
    return Response.json({ error: "ids must be an array of integers" }, { status: 400 });
  }
  await db.transaction(async (tx) => {
    for (let i = 0; i < ids.length; i++) {
      await tx.update(songs).set({ position: i + 1 }).where(eq(songs.id, ids[i] as number));
    }
  });
  return Response.json({ ok: true });
}
