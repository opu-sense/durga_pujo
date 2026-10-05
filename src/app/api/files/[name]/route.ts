import { stat, open } from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".m4a": "audio/mp4",
  ".aac": "audio/aac",
};

type Ctx = { params: Promise<{ name: string }> };

export async function GET(req: Request, ctx: Ctx) {
  const { name } = await ctx.params;
  if (!/^[\w.-]+$/.test(name) || name.includes("..")) {
    return new Response("Not found", { status: 404 });
  }
  const file = path.join(process.cwd(), "uploads", name);
  let size: number;
  try {
    size = (await stat(file)).size;
  } catch {
    return new Response("Not found", { status: 404 });
  }

  const type = MIME[path.extname(name).toLowerCase()] || "application/octet-stream";
  const range = req.headers.get("range");
  let start = 0;
  let end = size - 1;
  let status = 200;

  if (range) {
    const m = range.match(/bytes=(\d*)-(\d*)/);
    if (m) {
      if (m[1]) start = parseInt(m[1], 10);
      if (m[2]) end = Math.min(parseInt(m[2], 10), size - 1);
      if (!m[1] && m[2]) {
        start = Math.max(0, size - parseInt(m[2], 10));
        end = size - 1;
      }
      if (start > end || start >= size) {
        return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
      }
      status = 206;
    }
  }

  const fh = await open(file, "r");
  const len = end - start + 1;
  const buf = Buffer.alloc(len);
  await fh.read(buf, 0, len, start);
  await fh.close();

  const headers: Record<string, string> = {
    "Content-Type": type,
    "Content-Length": String(len),
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=31536000, immutable",
  };
  if (status === 206) headers["Content-Range"] = `bytes ${start}-${end}/${size}`;

  return new Response(new Uint8Array(buf), { status, headers });
}
