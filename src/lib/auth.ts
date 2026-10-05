import { createHash, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE = "pujo_admin";

function password() {
  return process.env.ADMIN_PASSWORD || "pujo2026";
}

export function tokenFor(pw: string) {
  return createHash("sha256").update(`devipaksha:${pw}`).digest("hex");
}

function safeEq(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function checkPassword(pw: string) {
  return safeEq(tokenFor(pw), tokenFor(password()));
}

function readCookie(req: Request, name: string) {
  const raw = req.headers.get("cookie") || "";
  for (const part of raw.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return null;
}

export function isAdmin(req: Request) {
  const c = readCookie(req, ADMIN_COOKIE);
  return !!c && safeEq(c, tokenFor(password()));
}

/** Returns a 401 Response if not admin, otherwise null. */
export function requireAdmin(req: Request): Response | null {
  if (isAdmin(req)) return null;
  return Response.json({ error: "Manager password lagbe (unauthorized)" }, { status: 401 });
}
