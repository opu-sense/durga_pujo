"use client";

import { useEffect, useRef, useState } from "react";
import type { Song } from "@/lib/types";
import { detectYouTube, fmtTime, parseDur } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Cover } from "./Cover";
import {
  IconPlay,
  IconPause,
  IconNext,
  IconPrev,
  IconShuffle,
  IconRepeat,
  IconDrum,
  IconYoutube,
  IconClose,
} from "./Icons";

type RepeatMode = "off" | "all" | "one";

export function Player({
  queue,
  currentId,
  onTrackChange,
  dhakLabel,
}: {
  queue: Song[];
  currentId: number | null;
  onTrackChange: (s: Song) => void;
  dhakLabel: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("off");
  const [dhak, setDhak] = useState(false);
  const [ytOpen, setYtOpen] = useState(false);

  const idx = Math.max(0, queue.findIndex((s) => s.id === currentId));
  const song = queue.find((s) => s.id === currentId) ?? queue[0] ?? null;

  const playingRef = useRef(false);
  playingRef.current = playing;
  const queueRef = useRef(queue);
  queueRef.current = queue;
  const idxRef = useRef(idx);
  idxRef.current = idx;
  const repeatRef = useRef(repeat);
  repeatRef.current = repeat;
  const shuffleRef = useRef(shuffle);
  shuffleRef.current = shuffle;
  const onTrackRef = useRef(onTrackChange);
  onTrackRef.current = onTrackChange;

  // When the queue (playlist) changes, fall back to its first song if the current one left the queue
  const queueKey = queue.map((s) => s.id).join(",");
  const lastQueueKey = useRef(queueKey);
  useEffect(() => {
    if (lastQueueKey.current !== queueKey) {
      lastQueueKey.current = queueKey;
      const q = queueRef.current;
      if (q.length && !q.some((s) => s.id === currentId)) {
        onTrackRef.current(q[0]);
      }
    }
  }, [queueKey, currentId]);

  // Load audio whenever the song changes
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    setTime(0);
    if (!song) {
      a.pause();
      setPlaying(false);
      return;
    }
    setDur(parseDur(song.duration));
    if (song.audioUrl) {
      if (a.src !== song.audioUrl) {
        a.src = song.audioUrl;
        a.load();
      }
      if (playingRef.current) a.play().catch(() => setPlaying(false));
    } else {
      a.pause();
      a.removeAttribute("src");
      setPlaying(false);
    }
    if (!song.youtubeUrl || song.audioUrl) setYtOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song?.id]);

  const advance = (dir: 1 | -1, auto = false) => {
    const q = queueRef.current;
    if (!q.length) return;
    let ni: number;
    if (shuffleRef.current && dir === 1) {
      ni = idxRef.current;
      if (q.length > 1) {
        do {
          ni = Math.floor(Math.random() * q.length);
        } while (ni === idxRef.current);
      }
    } else {
      ni = (idxRef.current + dir + q.length) % q.length;
    }
    if (!shuffleRef.current && dir === 1 && repeatRef.current === "off" && auto && idxRef.current === q.length - 1) {
      playingRef.current = false;
      setPlaying(false);
      const a = audioRef.current;
      if (a) a.currentTime = 0;
      setTime(0);
      return;
    }
    onTrackRef.current(q[ni]);
  };

  const onEnded = () => {
    if (repeatRef.current === "one") {
      const a = audioRef.current;
      if (a) {
        a.currentTime = 0;
        a.play().catch(() => setPlaying(false));
      }
      return;
    }
    advance(1, true);
  };

  const toggle = () => {
    const a = audioRef.current;
    if (!song || !a) return;
    if (!song.audioUrl) {
      if (song.youtubeUrl) setYtOpen((v) => !v);
      return;
    }
    if (!a.src) {
      a.src = song.audioUrl;
      a.load();
    }
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    }
  };

  const seekFromClientX = (clientX: number) => {
    const el = barRef.current;
    const a = audioRef.current;
    if (!el || !a || !song?.audioUrl) return;
    const total = isFinite(a.duration) && a.duration > 0 ? a.duration : dur;
    if (!total) return;
    const r = el.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    a.currentTime = p * total;
    setTime(p * total);
  };
  const barRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const pct = dur > 0 ? Math.min(100, (time / dur) * 100) : 0;
  const ytId = song && !song.audioUrl && song.youtubeUrl ? detectYouTube(song.youtubeUrl) : null;

  return (
    <div className="px-3 pb-3">
      {ytOpen && ytId && (
        <div className="mb-2 animate-pop overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
          <div className="flex items-center justify-between px-3 py-1.5">
            <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-white/50">
              <IconYoutube className="h-3.5 w-3.5 text-red-500" /> NOW PLAYING ON YOUTUBE
            </span>
            <button
              onClick={() => setYtOpen(false)}
              className="grid h-6 w-6 place-items-center rounded-full text-white/50 hover:bg-white/10 hover:text-white"
              aria-label="Close video"
            >
              <IconClose className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="aspect-video w-full">
            <iframe
              key={ytId}
              src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&playsinline=1&rel=0`}
              title={song?.title ?? "YouTube"}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        </div>
      )}
      <audio
        ref={audioRef}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => {
          if (isFinite(e.currentTarget.duration) && e.currentTarget.duration > 0) {
            setDur(e.currentTarget.duration);
          }
        }}
        onEnded={onEnded}
        className="hidden"
      />

      <div
        className={cn(
          "overflow-hidden rounded-2xl border bg-[#161310f2] shadow-[0_18px_50px_-12px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-colors",
          dhak ? "border-gold/35" : "border-white/10",
        )}
      >
        <div className="flex items-center gap-3 p-3 pr-2">
          <Cover
            src={song?.coverUrl}
            alt={song?.title ?? ""}
            className="h-[62px] w-[62px] shrink-0 rounded-xl ring-1 ring-white/10"
          >
            {song && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-1.5 pb-1 pt-4">
                <span className="block truncate font-script text-[11px] leading-none text-amber-100/90">
                  {song.title}
                </span>
              </div>
            )}
          </Cover>

          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <p className="truncate text-[15px] font-semibold text-white">{song?.title ?? "—"}</p>
              {!song?.audioUrl && song?.youtubeUrl && (
                <span className="shrink-0 rounded-full bg-gold/15 px-1.5 py-px text-[9px] font-bold tracking-wide text-goldsoft">
                  YT
                </span>
              )}
            </div>
            <p className="truncate text-xs text-mute">{song?.artist || "Unknown artist"}</p>
            <div
              ref={barRef}
              onPointerDown={(e) => {
                dragging.current = true;
                (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                seekFromClientX(e.clientX);
              }}
              onPointerMove={(e) => dragging.current && seekFromClientX(e.clientX)}
              onPointerUp={() => (dragging.current = false)}
              className={cn(
                "group mt-2 flex h-4 cursor-pointer touch-none items-center",
                !song?.audioUrl && "pointer-events-none opacity-50",
              )}
            >
              <div className="relative h-[3.5px] w-full overflow-visible rounded-full bg-white/15">
                <div
                  className={cn("absolute inset-y-0 left-0 rounded-full", dhak ? "bg-gold" : "bg-white/85")}
                  style={{ width: `${pct}%` }}
                />
                <div
                  className={cn(
                    "absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 shadow transition-opacity",
                    "group-hover:opacity-100",
                    dhak && "bg-goldsoft",
                  )}
                  style={{ left: `${pct}%` }}
                />
              </div>
            </div>
            <p className="mt-0.5 text-[10px] tabular-nums text-mute">
              {fmtTime(time)} / {fmtTime(dur)}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={() => {
                const a = audioRef.current;
                if (a && a.currentTime > 3) {
                  a.currentTime = 0;
                  setTime(0);
                  return;
                }
                advance(-1);
              }}
              className="grid h-9 w-9 place-items-center rounded-full text-white/60 transition hover:bg-white/5 hover:text-white active:scale-90"
              aria-label="Previous"
            >
              <IconPrev className="h-5 w-5" />
            </button>
            <button
              onClick={toggle}
              aria-label={playing ? "Pause" : "Play"}
              className={cn(
                "relative grid h-[52px] w-[52px] place-items-center rounded-2xl bg-white text-ink shadow-[0_6px_20px_rgba(0,0,0,0.45)] transition active:scale-90",
                dhak && "bg-goldsoft",
              )}
            >
              {dhak && playing && (
                <span className="pointer-events-none absolute inset-0 animate-dhak-ring rounded-2xl border-2 border-gold/80" />
              )}
              {playing && song?.audioUrl ? (
                <IconPause className="h-6 w-6" />
              ) : (
                <IconPlay className="h-6 w-6 translate-x-[2px]" />
              )}
            </button>
            <button
              onClick={() => advance(1)}
              className="grid h-9 w-9 place-items-center rounded-full text-white/60 transition hover:bg-white/5 hover:text-white active:scale-90"
              aria-label="Next"
            >
              <IconNext className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 divide-x divide-white/10 border-t border-white/10">
          <button
            onClick={() => setShuffle((v) => !v)}
            className={cn(
              "flex items-center justify-center gap-2 py-2.5 text-[11px] font-semibold tracking-wide transition",
              shuffle ? "text-goldsoft" : "text-white/55 hover:text-white/85",
            )}
          >
            <IconShuffle className="h-4 w-4" />
            Shuffle
          </button>
          <button
            onClick={() => setRepeat((r) => (r === "off" ? "all" : r === "all" ? "one" : "off"))}
            className={cn(
              "relative flex items-center justify-center gap-2 py-2.5 text-[11px] font-semibold tracking-wide transition",
              repeat !== "off" ? "text-goldsoft" : "text-white/55 hover:text-white/85",
            )}
          >
            <span className="relative">
              <IconRepeat className="h-4 w-4" />
              {repeat === "one" && (
                <span className="absolute -right-1.5 -top-1 grid h-3 w-3 place-items-center rounded-full bg-gold text-[8px] font-bold text-ink">
                  1
                </span>
              )}
            </span>
            Repeat
          </button>
          <button
            onClick={() => setDhak((v) => !v)}
            className={cn(
              "flex items-center justify-center gap-2 py-2.5 text-[11px] font-semibold tracking-wide transition",
              dhak ? "text-goldsoft" : "text-white/55 hover:text-white/85",
            )}
          >
            <IconDrum className={cn("h-4 w-4", dhak && "animate-blink")} />
            {dhakLabel}
            {dhak && <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_8px_rgba(233,180,76,0.9)]" />}
          </button>
        </div>
      </div>
    </div>
  );
}
