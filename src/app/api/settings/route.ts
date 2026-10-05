import { ensureSchema } from "@/db/ensure";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PUT(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  await ensureSchema();
  const body = await req.json().catch(() => null);
  if (!body) return Response.json({ error: "bad body" }, { status: 400 });

  const patch: Record<string, unknown> = {};
  const strKeys = [
    "bengaliTitle",
    "pujoDate",
    "heroImage",
    "contactEmail",
    "youtubeUrl",
    "spotifyUrl",
    "coffeeUrl",
    "dhakLabel",
  ];
  for (const k of strKeys) {
    if (body[k] !== undefined) patch[k] = String(body[k]);
  }
  if (body.onlineCount !== undefined) {
    const n = parseInt(String(body.onlineCount), 10);
    patch.onlineCount = isNaN(n) ? 0 : Math.max(0, n);
  }

  const [existing] = await db.select().from(siteSettings).limit(1);
  if (!existing) {
    const [row] = await db.insert(siteSettings).values(patch).returning();
    return Response.json({ settings: row });
  }
  const [row] = await db.update(siteSettings).set(patch).where(eq(siteSettings.id, existing.id)).returning();
  return Response.json({ settings: row });
}
