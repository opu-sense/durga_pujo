"use client";

import { useEffect, useRef, useState } from "react";
import type { Creator, PlaylistKey, Settings, Song } from "@/lib/types";
import { PLAYLISTS, isPlaylistKey } from "@/lib/types";
import { audioDurationOf, detectYouTube, fmtTime, pujoCountdownText, uploadFile, ytWatchUrl } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Cover } from "./Cover";
import {
  IconClose,
  IconUpload,
  IconLink,
  IconPencil,
  IconTrash,
  IconPlus,
  IconCheck,
  IconImage,
  IconMusic,
  IconYoutube,
  IconChevronDown,
} from "./Icons";

const inputCls =
  "w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25 transition focus:border-gold/60";

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-white/30">{hint}</span>}
    </label>
  );
}

type Tab = "songs" | "site" | "people";

export function AdminPanel({
  open,
  onClose,
  data,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  data: { songs: Song[]; settings: Settings; creators: Creator[] };
  onSaved: () => void;
}) {
  const [tab, setTab] = useState<Tab>("songs");
  const [editing, setEditing] = useState<Song | null>(null);
  const [flashMsg, setFlashMsg] = useState<string | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!open || authed) return;
    fetch("/api/admin", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setAuthed(!!j.admin))
      .catch(() => setAuthed(false));
  }, [open, authed]);

  if (!open) return null;

  const flash = (m: string) => {
    setFlashMsg(m);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlashMsg(null), 2200);
  };

  if (!authed) {
    return <LoginGate checking={authed === null} onClose={onClose} onSuccess={() => setAuthed(true)} />;
  }

  const moveSong = async (list: Song[], i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const ids = list.map((s) => s.id);
    [ids[i], ids[j]] = [ids[j], ids[i]];
    const res = await fetch("/api/songs/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) flash("Could not reorder");
    onSaved();
  };

  const logout = async () => {
    await fetch("/api/admin", { method: "DELETE" });
    setAuthed(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-center">
      <div className="absolute inset-0 animate-fadein bg-black/80 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative flex h-dvh w-full max-w-[520px] animate-rise flex-col border-x border-white/10 bg-[#0f0d0a]">
        <header className="flex items-center gap-3 border-b border-white/8 px-4 py-3">
          <h2 className="text-[12px] font-bold tracking-[0.3em] text-white/80">SITE MANAGER</h2>
          <div className="ml-auto flex items-center gap-1 rounded-full bg-white/6 p-1">
            {(["songs", "site", "people"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "rounded-full px-3 py-1 text-[10px] font-bold tracking-wider uppercase transition",
                  tab === t ? "bg-gold/90 text-ink" : "text-white/45 hover:text-white/80",
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <IconClose className="h-4.5 w-4.5" strokeWidth={2.2} />
          </button>
        </header>
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-1.5 text-[10px] text-white/35">
          <span>🔓 Logged in as manager</span>
          <button onClick={logout} className="font-semibold text-white/50 hover:text-red-300">
            Log out
          </button>
        </div>

        <div className="relative min-h-0 flex-1 overflow-y-auto p-4 pb-16 thin-scroll">
          {flashMsg && (
            <div className="pointer-events-none absolute inset-x-0 top-2 z-10 flex justify-center">
              <span className="flex animate-pop items-center gap-2 rounded-full border border-gold/40 bg-[#1c150a] px-4 py-1.5 text-xs font-semibold text-goldsoft shadow-lg">
                <IconCheck className="h-3.5 w-3.5" /> {flashMsg}
              </span>
            </div>
          )}

          {tab === "songs" && (
            <div className="space-y-5">
              <SongForm
                key={editing?.id ?? "new"}
                song={editing}
                flash={flash}
                onDone={() => {
                  setEditing(null);
                  onSaved();
                }}
                onCancel={() => setEditing(null)}
              />
              {!editing && <BulkUpload flash={flash} onDone={onSaved} />}
              <div className="space-y-4">
                {PLAYLISTS.map((pl) => {
                  const list = data.songs.filter((s) => s.playlist === pl.key).sort((a, b) => a.position - b.position);
                  return (
                    <div key={pl.key}>
                      <p className="mb-2 px-1 text-[10px] font-bold tracking-[0.25em] text-white/35">
                        {pl.label.toUpperCase()} · {list.length}
                      </p>
                      <div className="space-y-1">
                        {list.length === 0 && (
                          <p className="rounded-xl border border-dashed border-white/10 px-3 py-3 text-xs text-white/30">
                            Empty — use the form above.
                          </p>
                        )}
                        {list.map((s, i) => (
                          <div
                            key={s.id}
                            className="group flex items-center gap-3 rounded-xl border border-white/6 bg-white/2 px-3 py-2 transition hover:border-white/15"
                          >
                            <div className="flex shrink-0 flex-col">
                              <button
                                onClick={() => moveSong(list, i, -1)}
                                disabled={i === 0}
                                className="grid h-5 w-5 place-items-center rounded text-white/40 hover:bg-white/10 hover:text-goldsoft disabled:opacity-20"
                                aria-label="Move up"
                              >
                                <IconChevronDown className="h-3.5 w-3.5 rotate-180" strokeWidth={2.4} />
                              </button>
                              <button
                                onClick={() => moveSong(list, i, 1)}
                                disabled={i === list.length - 1}
                                className="grid h-5 w-5 place-items-center rounded text-white/40 hover:bg-white/10 hover:text-goldsoft disabled:opacity-20"
                                aria-label="Move down"
                              >
                                <IconChevronDown className="h-3.5 w-3.5" strokeWidth={2.4} />
                              </button>
                            </div>
                            <Cover src={s.coverUrl} className="h-10 w-10 shrink-0 rounded-lg" iconClass="h-3.5 w-3.5" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[13px] font-semibold text-white">{s.title}</p>
                              <p className="truncate text-[11px] text-mute">
                                {s.artist || "—"} · {s.duration}
                                {s.youtubeUrl && !s.audioUrl && (
                                  <span className="ml-1.5 text-goldsoft">· YT</span>
                                )}
                                {s.audioUrl && <span className="ml-1.5 text-white/35">· MP3</span>}
                                {!s.audioUrl && !s.youtubeUrl && (
                                  <span className="ml-1.5 text-red-400/80">· no audio</span>
                                )}
                              </p>
                            </div>
                            <button
                              onClick={() => setEditing(s)}
                              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white/40 transition hover:bg-white/10 hover:text-goldsoft"
                              aria-label="Edit"
                            >
                              <IconPencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={async () => {
                                await fetch(`/api/songs?id=${s.id}`, { method: "DELETE" });
                                flash("Song removed");
                                onSaved();
                              }}
                              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white/40 transition hover:bg-red-500/15 hover:text-red-400"
                              aria-label="Delete"
                            >
                              <IconTrash className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === "site" && <SiteTab settings={data.settings} flash={flash} onSaved={onSaved} />}
          {tab === "people" && (
            <PeopleTab creators={data.creators} flash={flash} onSaved={onSaved} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- Songs tab ---------------------------------- */

function SongForm({
  song,
  flash,
  onDone,
  onCancel,
}: {
  song: Song | null;
  flash: (m: string) => void;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(song?.title ?? "");
  const [artist, setArtist] = useState(song?.artist ?? "");
  const [playlist, setPlaylist] = useState<PlaylistKey>(song?.playlist ?? "durga_puja");
  const [duration, setDuration] = useState(song?.duration ?? "");
  const [coverUrl, setCoverUrl] = useState(song?.coverUrl ?? "");
  const [coverMode, setCoverMode] = useState<"file" | "url">(song?.coverUrl ? "url" : "file");
  const [audioUrl, setAudioUrl] = useState(song?.audioUrl ?? "");
  const [linkValue, setLinkValue] = useState(
    song && song.youtubeUrl && !song.audioUrl ? song.youtubeUrl : "",
  );
  const [audioTab, setAudioTab] = useState<"file" | "link">(
    song && song.youtubeUrl && !song.audioUrl ? "link" : "file",
  );
  const [busy, setBusy] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const pickAudio = async (f: File) => {
    setBusy("Uploading song…");
    try {
      const d = await audioDurationOf(f);
      const url = await uploadFile(f);
      setAudioUrl(url);
      setAudioTab("file");
      setLinkValue("");
      if (d > 1) setDuration(fmtTime(d));
      flash("Song file uploaded");
    } catch (e) {
      flash(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const pickCover = async (f: File) => {
    setBusy("Uploading photo…");
    try {
      const url = await uploadFile(f);
      setCoverUrl(url);
      flash("Photo uploaded");
    } catch (e) {
      flash(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(null);
      if (coverRef.current) coverRef.current.value = "";
    }
  };

  const submit = async () => {
    if (!title.trim()) return flash("Song title lagbe");
    let audio = "";
    let yt = "";
    if (audioTab === "link") {
      const v = linkValue.trim();
      if (!v) return flash("Link lagbe");
      const y = detectYouTube(v);
      if (y) yt = ytWatchUrl(y);
      else audio = v;
    } else {
      audio = audioUrl;
      if (!audio && !song) return flash("Audio file ba link lagbe");
    }
    const body = { ...base, audioUrl: audio, youtubeUrl: yt };
    setBusy("Saving…");
    try {
      const res = song
        ? await fetch(`/api/songs/${song.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch("/api/songs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
      if (!res.ok) throw new Error();
      flash(song ? "Song updated" : "Song added");
      onDone();
    } catch {
      flash("Could not save — try again");
    } finally {
      setBusy(null);
    }
  };

  const base = {
    title: title.trim(),
    artist: artist.trim(),
    playlist,
    duration: duration.trim() || "0:00",
    coverUrl: coverUrl.trim(),
  };

  return (
    <section className="rounded-2xl border border-gold/25 bg-gradient-to-b from-[#1b1409] to-[#12100b] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[12px] font-bold tracking-[0.2em] text-goldsoft">
          <IconMusic className="h-4 w-4" />
          {song ? "EDIT SONG" : "ADD A NEW SONG"}
        </h3>
        {song && (
          <button
            onClick={onCancel}
            className="text-[11px] font-semibold text-white/45 underline-offset-2 hover:text-white/80 hover:underline"
          >
            Cancel
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 sm:col-span-1">
          <Field label="Song title">
            <input
              className={inputCls}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Dugga Elo"
            />
          </Field>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Field label="Artist">
            <input
              className={inputCls}
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Monali Thakur"
            />
          </Field>
        </div>
        <Field label="Playlist">
          <select
            className={cn(inputCls, "appearance-none")}
            value={playlist}
            onChange={(e) => setPlaylist(isPlaylistKey(e.target.value) ? e.target.value : "durga_puja")}
          >
            {PLAYLISTS.map((p) => (
              <option key={p.key} value={p.key} className="bg-[#14110c]">
                {p.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Duration" hint="Auto-filled from MP3">
          <input
            className={inputCls}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="3:20"
          />
        </Field>

        <div className="col-span-2">
          <Field label="Song audio" hint="Upload a MP3 file, or paste a MP3 / YouTube link.">
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={() => fileRef.current?.click()}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition",
                    audioTab === "file"
                      ? "border-gold/50 bg-gold/10 text-goldsoft"
                      : "border-white/10 bg-black/30 text-white/50 hover:text-white/80",
                  )}
                >
                  <IconUpload className="h-4 w-4" />
                  {busy === "Uploading song…" ? "Uploading…" : "Upload MP3"}
                </button>
                <button
                  onClick={() => setAudioTab("link")}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition",
                    audioTab === "link"
                      ? "border-gold/50 bg-gold/10 text-goldsoft"
                      : "border-white/10 bg-black/30 text-white/50 hover:text-white/80",
                  )}
                >
                  <IconLink className="h-4 w-4" />
                  Paste link
                </button>
              </div>
              <input ref={fileRef} type="file" accept="audio/*" className="hidden" onChange={(e) => e.target.files?.[0] && pickAudio(e.target.files[0])} />
              {audioTab === "file" && audioUrl && (
                <p className="flex items-center gap-1.5 text-[11px] text-emerald-300/90">
                  <IconCheck className="h-3 w-3" /> MP3 file attached
                </p>
              )}
              {audioTab === "link" && (
                <input
                  className={inputCls}
                  value={linkValue}
                  onChange={(e) => setLinkValue(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=… or https://…/song.mp3"
                />
              )}
              {linkValue && detectYouTube(linkValue) && (
                <p className="flex items-center gap-1.5 text-[11px] text-goldsoft">
                  <IconYoutube className="h-3 w-3" /> YouTube video detected — opens on play
                </p>
              )}
            </div>
          </Field>
        </div>

        <div className="col-span-2">
          <Field label="Cover photo">
            <div className="flex items-center gap-3">
              <Cover src={coverUrl} className="h-14 w-14 shrink-0 rounded-xl ring-1 ring-white/15" iconClass="h-4 w-4" />
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => coverRef.current?.click()}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition",
                      coverMode === "file"
                        ? "border-gold/50 bg-gold/10 text-goldsoft"
                        : "border-white/10 bg-black/30 text-white/50 hover:text-white/80",
                    )}
                  >
                    <IconImage className="h-4 w-4" />
                    {busy === "Uploading photo…" ? "Uploading…" : "Upload"}
                  </button>
                  <button
                    onClick={() => setCoverMode("url")}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition",
                      coverMode === "url"
                        ? "border-gold/50 bg-gold/10 text-goldsoft"
                        : "border-white/10 bg-black/30 text-white/50 hover:text-white/80",
                    )}
                  >
                    <IconLink className="h-4 w-4" />
                    Use URL
                  </button>
                </div>
                {coverMode === "url" && (
                  <input
                    className={inputCls}
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    placeholder="https://…/cover.jpg"
                  />
                )}
                <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && pickCover(e.target.files[0])} />
              </div>
            </div>
          </Field>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={submit}
          disabled={!!busy}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3 text-sm font-bold text-ink transition hover:bg-goldsoft active:scale-[0.98] disabled:opacity-50"
        >
          {busy === "Saving…" ? (
            "Saving…"
          ) : (
            <>
              <IconPlus className="h-4 w-4" strokeWidth={2.6} />
              {song ? "Save changes" : "Add song"}
            </>
          )}
        </button>
        {song && (
          <button
            onClick={async () => {
              await fetch(`/api/songs?id=${song.id}`, { method: "DELETE" });
              flash("Song removed");
              onDone();
            }}
            className="grid w-12 place-items-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 transition hover:bg-red-500/20"
            aria-label="Delete song"
          >
            <IconTrash className="h-4.5 w-4.5" />
          </button>
        )}
      </div>
    </section>
  );
}

/* ---------------------------------- Site tab ---------------------------------- */

function SiteTab({
  settings,
  flash,
  onSaved,
}: {
  settings: Settings;
  flash: (m: string) => void;
  onSaved: () => void;
}) {
  const [f, setF] = useState({ ...settings });
  const heroRef = useRef<HTMLInputElement>(null);
  const [heroMode, setHeroMode] = useState<"file" | "url">("file");
  const [busy, setBusy] = useState(false);
  const set = (k: keyof Settings, v: string | number) => setF((p) => ({ ...p, [k]: v }));

  const save = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      if (!res.ok) throw new Error();
      flash("Site saved");
      onSaved();
    } catch {
      flash("Could not save");
    } finally {
      setBusy(false);
    }
  };

  const uploadHero = async (file: File) => {
    setBusy(true);
    try {
      const url = await uploadFile(file);
      set("heroImage", url);
      flash("Hero photo uploaded");
    } catch (e) {
      flash(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (heroRef.current) heroRef.current.value = "";
    }
  };

  return (
    <section className="space-y-4">
      <div className="space-y-4 rounded-2xl border border-white/10 bg-white/2 p-4">
        <h3 className="text-[12px] font-bold tracking-[0.2em] text-white/70">HOMEPAGE</h3>
        <Field label="Bengali heading">
          <input
            className={cn(inputCls, "font-bengali text-lg")}
            value={f.bengaliTitle}
            onChange={(e) => set("bengaliTitle", e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Online count">
            <input
              type="number"
              className={inputCls}
              value={f.onlineCount}
              onChange={(e) => set("onlineCount", Number(e.target.value) || 0)}
            />
          </Field>
          <Field label="Pujo date" hint={pujoCountdownText(f.pujoDate)}>
            <input
              type="date"
              className={inputCls}
              value={f.pujoDate}
              onChange={(e) => set("pujoDate", e.target.value)}
            />
          </Field>
        </div>
        <Field label="Hero image">
          <div className="flex items-center gap-3">
            <Cover src={f.heroImage} className="h-16 w-24 shrink-0 rounded-xl ring-1 ring-white/15" iconClass="h-4 w-4" />
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={() => heroRef.current?.click()}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition",
                    heroMode === "file"
                      ? "border-gold/50 bg-gold/10 text-goldsoft"
                      : "border-white/10 bg-black/30 text-white/50",
                  )}
                >
                  <IconUpload className="h-4 w-4" />
                  Upload
                </button>
                <button
                  onClick={() => setHeroMode("url")}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition",
                    heroMode === "url"
                      ? "border-gold/50 bg-gold/10 text-goldsoft"
                      : "border-white/10 bg-black/30 text-white/50",
                  )}
                >
                  <IconLink className="h-4 w-4" />
                  URL
                </button>
              </div>
              {heroMode === "url" && (
                <input
                  className={inputCls}
                  value={f.heroImage}
                  onChange={(e) => set("heroImage", e.target.value)}
                  placeholder="https://…/hero.jpg"
                />
              )}
              <input ref={heroRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadHero(e.target.files[0])} />
            </div>
          </div>
        </Field>
      </div>

      <div className="space-y-4 rounded-2xl border border-white/10 bg-white/2 p-4">
        <h3 className="text-[12px] font-bold tracking-[0.2em] text-white/70">CONTACT & LINKS</h3>
        <Field label="Contact email">
          <input className={inputCls} value={f.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} />
        </Field>
        <div className="grid grid-cols-1 gap-3">
          <Field label="YouTube link">
            <input className={inputCls} value={f.youtubeUrl} onChange={(e) => set("youtubeUrl", e.target.value)} placeholder="https://youtube.com/@…" />
          </Field>
          <Field label="Spotify link">
            <input className={inputCls} value={f.spotifyUrl} onChange={(e) => set("spotifyUrl", e.target.value)} placeholder="https://open.spotify.com/…" />
          </Field>
          <Field label="Buy me a coffee link">
            <input className={inputCls} value={f.coffeeUrl} onChange={(e) => set("coffeeUrl", e.target.value)} placeholder="https://buymeacoffee.com/…" />
          </Field>
          <Field label="Dhak button label">
            <input className={inputCls} value={f.dhakLabel} onChange={(e) => set("dhakLabel", e.target.value)} />
          </Field>
        </div>
      </div>

      <button
        onClick={save}
        disabled={busy}
        className="w-full rounded-xl bg-gold px-4 py-3 text-sm font-bold text-ink transition hover:bg-goldsoft active:scale-[0.98] disabled:opacity-50"
      >
        {busy ? "Saving…" : "Save site"}
      </button>
    </section>
  );
}

/* ---------------------------------- People tab ---------------------------------- */

function PeopleTab({
  creators,
  flash,
  onSaved,
}: {
  creators: Creator[];
  flash: (m: string) => void;
  onSaved: () => void;
}) {
  const [adding, setAdding] = useState(false);
  return (
    <section className="space-y-3">
      <p className="px-1 text-[11px] text-white/40">
        The “Made with Bhalobasha by” cards. Add your name, photo and social links.
      </p>
      {creators.map((c) => (
        <PersonCard key={c.id} creator={c} flash={flash} onSaved={onSaved} />
      ))}
      {adding ? (
        <PersonCard creator={null} flash={flash} onSaved={onSaved} onCancel={() => setAdding(false)} />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 px-4 py-4 text-xs font-bold text-white/55 transition hover:border-gold/50 hover:text-goldsoft"
        >
          <IconPlus className="h-4 w-4" /> Add a person
        </button>
      )}
    </section>
  );
}

function PersonCard({
  creator,
  flash,
  onSaved,
  onCancel,
}: {
  creator: Creator | null;
  flash: (m: string) => void;
  onSaved: () => void;
  onCancel?: () => void;
}) {
  const [name, setName] = useState(creator?.name ?? "");
  const [photo, setPhoto] = useState(creator?.photoUrl ?? "");
  const [linkedin, setLinkedin] = useState(creator?.linkedin ?? "");
  const [instagram, setInstagram] = useState(creator?.instagram ?? "");
  const [busy, setBusy] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);

  const save = async () => {
    if (!name.trim()) return flash("Name lagbe");
    setBusy(true);
    try {
      const body = { name: name.trim(), photoUrl: photo, linkedin, instagram };
      const res = creator
        ? await fetch(`/api/creators/${creator.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch("/api/creators", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
      if (!res.ok) throw new Error();
      flash(creator ? "Person updated" : "Person added");
      onSaved();
      onCancel?.();
    } catch {
      flash("Could not save");
    } finally {
      setBusy(false);
    }
  };

  const uploadPhoto = async (file: File) => {
    setBusy(true);
    try {
      const url = await uploadFile(file);
      setPhoto(url);
      flash("Photo uploaded");
    } catch (e) {
      flash(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (photoRef.current) photoRef.current.value = "";
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/2 p-4">
      <div className="flex items-center gap-3">
        <Cover src={photo} className="h-14 w-14 shrink-0 rounded-full ring-2 ring-gold/30" iconClass="h-4 w-4" />
        <div className="grid flex-1 grid-cols-2 gap-2">
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
          <input
            className={inputCls}
            value={photo}
            onChange={(e) => setPhoto(e.target.value)}
            placeholder="Photo URL"
          />
          <input className={inputCls} value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="LinkedIn URL" />
          <input className={inputCls} value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="Instagram URL" />
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => photoRef.current?.click()}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-xs font-semibold text-white/70 transition hover:border-gold/50 hover:text-goldsoft"
        >
          <IconUpload className="h-4 w-4" />
          {busy ? "Uploading…" : "Photo"}
        </button>
        <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0])} />
        <button
          onClick={save}
          disabled={busy}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gold px-3 py-2 text-xs font-bold text-ink transition hover:bg-goldsoft disabled:opacity-50"
        >
          <IconCheck className="h-4 w-4" />
          Save
        </button>
        {creator ? (
          <button
            onClick={async () => {
              if (!confirmDel) {
                setConfirmDel(true);
                setTimeout(() => setConfirmDel(false), 2500);
                return;
              }
              await fetch(`/api/creators?id=${creator.id}`, { method: "DELETE" });
              flash("Person removed");
              onSaved();
            }}
            className={cn(
              "grid w-11 place-items-center rounded-xl border text-xs font-bold transition",
              confirmDel
                ? "border-red-500/60 bg-red-500/20 text-red-300"
                : "border-red-500/25 bg-red-500/10 text-red-400/80 hover:bg-red-500/20",
            )}
          >
            {confirmDel ? "Sure?" : <IconTrash className="h-4 w-4" />}
          </button>
        ) : (
          <button
            onClick={onCancel}
            className="grid w-11 place-items-center rounded-xl border border-white/15 text-white/60 hover:text-white"
          >
            <IconClose className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------- Login gate ---------------------------------- */

function LoginGate({
  checking,
  onClose,
  onSuccess,
}: {
  checking: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pw) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      if (!res.ok) throw new Error();
      onSuccess();
    } catch {
      setErr("Bhul password — abar try korun");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 animate-fadein bg-black/80 backdrop-blur-[2px]" onClick={onClose} />
      <form
        onSubmit={submit}
        className="relative w-full max-w-[360px] animate-rise rounded-3xl border border-gold/25 bg-gradient-to-b from-[#1e160b] to-[#100d0a] p-6 text-center shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 grid h-8 w-8 place-items-center rounded-full text-white/50 hover:bg-white/10 hover:text-white"
          aria-label="Close"
        >
          <IconClose className="h-4 w-4" />
        </button>
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gold/15 text-2xl">🔒</div>
        <h2 className="mt-4 text-[12px] font-bold tracking-[0.3em] text-goldsoft">SITE MANAGER</h2>
        <p className="mt-1.5 text-xs text-white/45">Song ar photo add korte password din</p>
        {checking ? (
          <p className="mt-6 text-xs text-white/40">Checking…</p>
        ) : (
          <>
            <input
              type="password"
              autoFocus
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Password"
              className={cn(inputCls, "mt-5 text-center tracking-widest")}
            />
            {err && <p className="mt-2 text-xs text-red-400">{err}</p>}
            <button
              type="submit"
              disabled={busy || !pw}
              className="mt-4 w-full rounded-xl bg-gold py-3 text-sm font-bold text-ink transition hover:bg-goldsoft disabled:opacity-50"
            >
              {busy ? "Checking…" : "Unlock"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}

/* ---------------------------------- Bulk upload ---------------------------------- */

function parseFileName(name: string) {
  const base = name.replace(/\.[^.]+$/, "").replace(/[_]+/g, " ").replace(/\s+/g, " ").trim();
  const parts = base.split(/\s+-\s+/);
  if (parts.length >= 2) return { artist: parts[0].trim(), title: parts.slice(1).join(" - ").trim() };
  return { artist: "", title: base };
}

function BulkUpload({ flash, onDone }: { flash: (m: string) => void; onDone: () => void }) {
  const [playlist, setPlaylist] = useState<PlaylistKey>("durga_puja");
  const [progress, setProgress] = useState<{ done: number; total: number; current: string } | null>(null);
  const [drag, setDrag] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const run = async (files: File[]) => {
    const audio = files.filter((f) => f.type.startsWith("audio/") || /\.(mp3|wav|m4a|ogg|aac)$/i.test(f.name));
    if (!audio.length) return flash("Shudhu audio file (MP3) select korun");
    let ok = 0;
    for (let i = 0; i < audio.length; i++) {
      const f = audio[i];
      setProgress({ done: i, total: audio.length, current: f.name });
      try {
        const d = await audioDurationOf(f);
        const url = await uploadFile(f);
        const { title, artist } = parseFileName(f.name);
        const res = await fetch("/api/songs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title || f.name,
            artist,
            playlist,
            duration: d > 1 ? fmtTime(d) : "0:00",
            audioUrl: url,
          }),
        });
        if (res.ok) ok++;
      } catch {
        /* skip failed file */
      }
    }
    setProgress(null);
    if (ref.current) ref.current.value = "";
    flash(`${ok} / ${audio.length} songs added`);
    onDone();
  };

  return (
    <section
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        if (!progress) run(Array.from(e.dataTransfer.files));
      }}
      className={cn(
        "rounded-2xl border border-dashed p-4 transition",
        drag ? "border-gold bg-gold/10" : "border-white/15 bg-white/2",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[12px] font-bold tracking-[0.2em] text-white/70">⚡ BULK ADD MANY SONGS</h3>
        <select
          value={playlist}
          onChange={(e) => setPlaylist(isPlaylistKey(e.target.value) ? e.target.value : "durga_puja")}
          className="rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-[11px] text-white outline-none"
        >
          {PLAYLISTS.map((p) => (
            <option key={p.key} value={p.key} className="bg-[#14110c]">
              {p.label}
            </option>
          ))}
        </select>
      </div>
      <p className="mt-1.5 text-[11px] leading-relaxed text-white/35">
        Ek sathe onek MP3 select/drop korun. Filename <span className="text-white/60">“Artist - Title.mp3”</span>{" "}
        hole artist ar title auto set hobe. Cover photo pore edit kore din.
      </p>
      {progress ? (
        <div className="mt-3">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-gold transition-all"
              style={{ width: `${(progress.done / progress.total) * 100}%` }}
            />
          </div>
          <p className="mt-1.5 truncate text-[11px] text-goldsoft">
            Uploading {progress.done + 1}/{progress.total}: {progress.current}
          </p>
        </div>
      ) : (
        <button
          onClick={() => ref.current?.click()}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/12 bg-black/30 py-3 text-xs font-bold text-white/75 transition hover:border-gold/50 hover:text-goldsoft"
        >
          <IconUpload className="h-4 w-4" /> Select multiple MP3 files
        </button>
      )}
      <input
        ref={ref}
        type="file"
        accept="audio/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && run(Array.from(e.target.files))}
      />
    </section>
  );
}
