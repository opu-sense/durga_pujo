export function fmtTime(sec: number) {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function parseDur(t: string) {
  const [m, s] = (t || "0:00").split(":").map((x) => parseInt(x, 10));
  return (isNaN(m) ? 0 : m) * 60 + (isNaN(s) ? 0 : s);
}

export function daysUntil(dateStr: string) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(`${dateStr}T00:00:00`);
  if (isNaN(d.getTime())) return null;
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

export function pujoCountdownText(dateStr: string) {
  const days = daysUntil(dateStr);
  if (days === null) return "Days until Durga Pujo";
  if (days > 1) return `${days} days until Durga Pujo`;
  if (days === 1) return "1 day until Durga Pujo";
  if (days === 0) return "Durga Pujo is here!";
  return "Durga Pujo bhola geche — shubhe shuru!";
}

const YT_RE = /(?:youtube\.com\/(?:watch\?.*v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/;

export function detectYouTube(url: string): string | null {
  const m = url.match(YT_RE);
  return m ? m[1] : null;
}

export function ytWatchUrl(id: string) {
  return `https://www.youtube.com/watch?v=${id}`;
}

export async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Upload failed");
  }
  const j = await res.json();
  return j.url as string;
}

export function audioDurationOf(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const a = new Audio();
    let done = false;
    const finish = (v: number) => {
      if (done) return;
      done = true;
      URL.revokeObjectURL(url);
      resolve(v);
    };
    a.preload = "metadata";
    a.onloadedmetadata = () => finish(a.duration);
    a.onerror = () => finish(0);
    setTimeout(() => finish(0), 8000);
    a.src = url;
  });
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
}
