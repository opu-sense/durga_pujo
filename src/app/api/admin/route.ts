import { ADMIN_COOKIE, checkPassword, isAdmin, tokenFor } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return Response.json({ admin: isAdmin(req) });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const pw = String(body?.password ?? "");
  if (!pw || !checkPassword(pw)) {
    return Response.json({ error: "Wrong password" }, { status: 401 });
  }
  const res = Response.json({ admin: true });
  res.headers.append(
    "Set-Cookie",
    `${ADMIN_COOKIE}=${tokenFor(pw)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`,
  );
  return res;
}

export async function DELETE() {
  const res = Response.json({ admin: false });
  res.headers.append("Set-Cookie", `${ADMIN_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
  return res;
}
