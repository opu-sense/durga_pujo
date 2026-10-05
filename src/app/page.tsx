"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Creator, PlaylistKey, Settings, Song } from "@/lib/types";
import { playlistInfo } from "@/lib/types";
import { pujoCountdownText } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Player } from "@/components/Player";
import { PlaylistModal } from "@/components/PlaylistModal";
import { PeopleModal } from "@/components/PeopleModal";
import { AdminPanel } from "@/components/AdminPanel";
import {
  IconYoutube,
  IconSpotify,
  IconUsers,
  IconCoffee,
  IconPlus,
  IconList,
  IconChevronDown,
} from "@/components/Icons";

interface Data {
  settings: Settings;
  creators: Creator[];
  songs: Song[];
}

export default function Home() {
  const [data, setData] = useState<Data | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [activePlaylist, setActivePlaylist] = useState<PlaylistKey>("durga_puja");
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showPeople, setShowPeople] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  const load = useCallback(async () => {
    setLoadError(false);
    try {
      const res = await fetch("/api/data", { cache: "no-store" });
      if (!res.ok) throw new Error("bad response");
      const j: Data = await res.json();
      setData(j);
      setCurrentId((prev) => {
        if (prev && j.songs.some((s) => s.id === prev)) return prev;
        const first = j.songs
          .filter((s) => s.playlist === "durga_puja")
          .sort((a, b) => a.position - b.position)[0];
        return first?.id ?? j.songs[0]?.id ?? null;
      });
    } catch {
      setLoadError(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const queue = useMemo(
    () =>
      (data?.songs ?? [])
        .filter((s) => s.playlist === activePlaylist)
        .sort((a, b) => a.position - b.position),
    [data, activePlaylist],
  );

  const trackChange = useCallback(
    (s: Song) => {
      setCurrentId(s.id);
      setActivePlaylist(s.playlist);
    },
    [],
  );

  if (loadError) {
    return (
      <Shell>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="text-3xl font-bengali text-gold">দুঃখিত</p>
          <p className="text-sm text-mute">Something went wrong loading the site.</p>
          <button
            onClick={load}
            className="rounded-full bg-gold px-5 py-2 text-sm font-bold text-ink transition hover:bg-goldsoft"
          >
            Try again
          </button>
        </div>
      </Shell>
    );
  }

  if (!data) {
    return (
      <Shell>
        <div className="flex items-center justify-between px-4 pt-4">
          <div className="h-9 w-28 animate-pulse rounded-full bg-white/8" />
          <div className="flex gap-2">
            <div className="h-9 w-24 animate-pulse rounded-full bg-white/8" />
            <div className="h-9 w-24 animate-pulse rounded-full bg-white/8" />
          </div>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <div className="h-10 w-48 animate-pulse rounded-xl bg-white/8" />
          <div className="h-3 w-40 animate-pulse rounded bg-white/6" />
          <p className="mt-6 text-xs tracking-widest text-white/30">LOADING PUJO…</p>
        </div>
        <div className="mx-3 mb-3 h-36 animate-pulse rounded-2xl bg-white/5" />
      </Shell>
    );
  }

  const { settings, creators, songs } = data;

  return (
    <Shell>
      {/* Top bar */}
      <header className="flex items-center justify-between gap-2 px-3 pt-3 pb-1">
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1.5 pr-4 pl-3 backdrop-blur">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-xs font-semibold text-white/85">{settings.onlineCount} online</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center overflow-hidden rounded-full border border-white/10 bg-white/5 backdrop-blur">
            <TopIcon label="YouTube" href={settings.youtubeUrl || undefined}>
              <IconYoutube className="h-4.5 w-4.5" />
            </TopIcon>
            <span className="h-4 w-px bg-white/10" />
            <TopIcon label="Spotify" href={settings.spotifyUrl || undefined}>
              <IconSpotify className="h-4.5 w-4.5" />
            </TopIcon>
          </div>
          <div className="flex items-center overflow-hidden rounded-full border border-white/10 bg-white/5 backdrop-blur">
            <TopIcon label="Made by" onClick={() => setShowPeople(true)}>
              <IconUsers className="h-4.5 w-4.5" />
            </TopIcon>
            <span className="h-4 w-px bg-white/10" />
            <TopIcon label="Support" href={settings.coffeeUrl || undefined} active>
              <IconCoffee className="h-4.5 w-4.5" />
            </TopIcon>
          </div>
          <button
            onClick={() => setShowAdmin(true)}
            className="grid h-9 w-9 place-items-center rounded-full border border-gold/40 bg-gold/10 text-goldsoft transition hover:bg-gold/20 active:scale-90"
            aria-label="Site manager"
            title="Site manager — add songs & photos"
          >
            <IconPlus className="h-4.5 w-4.5" strokeWidth={2.4} />
          </button>
        </div>
      </header>

      {/* Hero */}
      <main className="relative min-h-0 flex-1 overflow-hidden">
        {settings.heroImage && (
          <img
            src={settings.heroImage}
            alt="Durga Pujo pandal at night"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/90 via-ink/10 to-ink" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(233,180,76,0.14),transparent_55%)]" />

        <div className="relative z-10 flex h-full flex-col items-center pt-7 text-center">
          <h1
            className="font-bengali text-[44px] leading-tight font-bold text-gold drop-shadow-[0_2px_18px_rgba(0,0,0,0.75)]"
            style={{ textShadow: "0 0 40px rgba(233,180,76,0.35)" }}
          >
            {settings.bengaliTitle}
          </h1>
          <p className="mt-2 text-[13px] font-medium tracking-wide text-white/65">
            {pujoCountdownText(settings.pujoDate)}
          </p>
        </div>

        <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center">
          <button
            onClick={() => setShowPlaylist(true)}
            className="group flex items-center gap-2 rounded-full border border-white/12 bg-ink/60 px-4 py-2 backdrop-blur-md transition hover:border-gold/40"
          >
            <IconList className="h-3.5 w-3.5 text-goldsoft" strokeWidth={2.2} />
            <span className="text-[11px] font-bold tracking-[0.22em] text-white/85 uppercase">
              {playlistInfo(activePlaylist).label}
            </span>
            <IconChevronDown className="h-3.5 w-3.5 text-white/50 transition group-hover:translate-y-0.5" />
          </button>
        </div>
      </main>

      {/* Player */}
      <Player
        queue={queue}
        currentId={currentId}
        onTrackChange={trackChange}
        dhakLabel={settings.dhakLabel || "Dhak"}
      />

      {/* Modals */}
      <PlaylistModal
        open={showPlaylist}
        onClose={() => setShowPlaylist(false)}
        songs={songs}
        active={activePlaylist}
        onActiveChange={setActivePlaylist}
        currentId={currentId}
        onPlay={trackChange}
      />
      <PeopleModal
        open={showPeople}
        onClose={() => setShowPeople(false)}
        creators={creators}
        email={settings.contactEmail}
      />
      <AdminPanel
        open={showAdmin}
        onClose={() => setShowAdmin(false)}
        data={data}
        onSaved={load}
      />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh justify-center bg-[#070605]">
      <div className="relative flex h-dvh w-full max-w-[520px] flex-col border-x border-white/5 bg-ink shadow-[0_0_120px_rgba(233,180,76,0.06)]">
        {children}
      </div>
    </div>
  );
}

function TopIcon({
  children,
  label,
  href,
  onClick,
  active,
}: {
  children: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  active?: boolean;
}) {
  const cls = cn(
    "grid h-9 w-9 place-items-center text-white/75 transition hover:text-white active:scale-90",
    active && "rounded-full bg-gold/15 text-goldsoft ring-1 ring-gold/40",
  );
  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" aria-label={label} className={cls}>
        {children}
      </a>
    );
  }
  return (
    <button onClick={onClick} aria-label={label} className={cls}>
      {children}
    </button>
  );
}
