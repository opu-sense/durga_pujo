import { requireAdmin } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_SIZE = 25 * 1024 * 1024; // 25 MB

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "audio/mpeg": ".mp3",
  "audio/mp3": ".mp3",
  "audio/wav": ".wav",
  "audio/x-wav": ".wav",
  "audio/ogg": ".ogg",
  "audio/mp4": ".m4a",
  "audio/aac": ".aac",
};

export async function POST(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  const isImage = file.type.startsWith("image/");
  const isAudio = file.type.startsWith("audio/");
  if (!isImage && !isAudio) {
    return Response.json({ error: "Only image or audio files are allowed" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return Response.json({ error: "File too big (max 25 MB)" }, { status: 413 });
  }

  const ext = EXT_BY_MIME[file.type] || path.extname(file.name).toLowerCase() || (isImage ? ".jpg" : ".mp3");

  const dir = path.join(process.cwd(), "uploads");
  await mkdir(dir, { recursive: true });
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, name), bytes);

  return Response.json({ url: `/uploads/${name}` }, { status: 201 });
}
