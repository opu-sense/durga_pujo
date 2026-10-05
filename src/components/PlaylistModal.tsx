"use client";

import type { Song, PlaylistKey } from "@/lib/types";
import { PLAYLISTS } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Cover } from "./Cover";
import { IconClose } from "./Icons";

export function PlaylistModal({
  open,
  onClose,
  songs,
  active,
  onActiveChange,
  currentId,
  onPlay,
}: {
  open: boolean;
  onClose: () => void;
  songs: Song[];
  active: PlaylistKey;
  onActiveChange: (k: PlaylistKey) => void;
  currentId: number | null;
  onPlay: (s: Song) => void;
}) {
  if (!open) return null;
  const info = PLAYLISTS.find((p) => p.key === active) ?? PLAYLISTS[0];
  const list = songs
    .filter((s) => s.playlist === active)
    .sort((a, b) => a.position - b.position);

  return (
    <div className="fixed inset-0 z-50 flex justify-center">
      <div className="absolute inset-0 animate-fadein bg-black/75 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative m-3 mt-14 flex w-full max-w-[520px] animate-rise flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#12100c] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]">
        <header className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-[13px] font-bold tracking-[0.35em] text-white/80">PLAYLISTS</h2>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <IconClose className="h-4.5 w-4.5" strokeWidth={2.2} />
          </button>
        </header>

        <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 pb-3">
          {PLAYLISTS.map((p) => (
            <button
              key={p.key}
              onClick={() => onActiveChange(p.key)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-[11px] font-bold tracking-[0.14em] uppercase transition",
                active === p.key
                  ? "bg-white/12 text-white shadow-inner"
                  : "text-white/45 hover:bg-white/5 hover:text-white/75",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        <p className="px-5 pb-3 text-xs text-white/40">{info.desc}</p>

        <div className="thin-scroll min-h-0 flex-1 overflow-y-auto border-t border-white/8 px-3 pb-4">
          {list.length === 0 && (
            <div className="px-3 py-10 text-center text-sm text-white/35">
              No songs here yet — add some from the manager.
            </div>
          )}
          {list.map((s, i) => {
            const isCur = s.id === currentId;
            return (
              <button
                key={s.id}
                onClick={() => onPlay(s)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl px-2.5 py-2.5 text-left transition",
                  isCur ? "bg-white/8 ring-1 ring-white/10" : "hover:bg-white/4",
                )}
              >
                <span
                  className={cn(
                    "w-7 shrink-0 text-center text-xs font-semibold tabular-nums",
                    isCur ? "text-gold" : "text-white/35",
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Cover src={s.coverUrl} alt={s.title} className="h-12 w-12 shrink-0 rounded-lg ring-1 ring-white/10" iconClass="h-4 w-4" />
                <div className="min-w-0 flex-1">
                  <p className={cn("truncate text-sm font-semibold", isCur ? "text-gold" : "text-white")}>
                    {s.title}
                  </p>
                  <p className="truncate text-xs text-mute">{s.artist || "Unknown"}</p>
                </div>
                {s.youtubeUrl && !s.audioUrl && (
                  <span className="shrink-0 rounded-full bg-gold/15 px-1.5 py-px text-[9px] font-bold text-goldsoft">
                    YT
                  </span>
                )}
                <span className="shrink-0 text-xs tabular-nums text-white/40">{s.duration}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
