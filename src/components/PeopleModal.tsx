"use client";

import { useState } from "react";
import type { Creator } from "@/lib/types";
import { copyText } from "@/lib/format";
import { Cover } from "./Cover";
import { IconClose, IconCopy, IconCheck, IconInstagram } from "./Icons";

export function PeopleModal({
  open,
  onClose,
  creators,
  email,
}: {
  open: boolean;
  onClose: () => void;
  creators: Creator[];
  email: string;
}) {
  const [copied, setCopied] = useState(false);
  if (!open) return null;

  const doCopy = async () => {
    const ok = await copyText(email);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 animate-fadein bg-black/75 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative w-full max-w-[400px] animate-rise rounded-3xl border border-white/10 bg-gradient-to-b from-[#241a10] via-[#161210] to-[#100d0b] p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]">
        <div className="absolute -left-16 top-10 h-48 w-48 rounded-full bg-gold/10 blur-3xl" />
        <header className="relative flex items-start justify-between">
          <h2 className="mt-1 text-[12px] font-bold tracking-[0.32em] text-white/70">
            MADE WITH BHALOBASHA BY
          </h2>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <IconClose className="h-4.5 w-4.5" strokeWidth={2.2} />
          </button>
        </header>

        <div className="relative mt-5 space-y-4">
          {creators.length === 0 && (
            <p className="py-6 text-center text-sm text-white/35">No people added yet.</p>
          )}
          {creators.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#2c2013]/80 via-[#1c1712]/60 to-transparent px-6 py-7 text-center"
            >
              <Cover
                src={c.photoUrl}
                alt={c.name}
                className="mx-auto h-20 w-20 rounded-full ring-2 ring-gold/30"
                iconClass="h-6 w-6"
              >
                {!c.photoUrl && (
                  <span className="absolute inset-0 grid place-items-center font-bengali text-xl font-bold text-goldsoft">
                    {c.name
                      .split(" ")
                      .slice(0, 2)
                      .map((w) => w[0])
                      .join("")}
                  </span>
                )}
              </Cover>
              <p className="mt-4 text-[15px] font-bold text-white">{c.name}</p>
              <div className="mt-3.5 flex items-center justify-center gap-3">
                {c.linkedin && (
                  <a
                    href={c.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="grid h-9 w-9 place-items-center rounded-full bg-white/8 text-[11px] font-bold text-white/80 ring-1 ring-white/15 transition hover:bg-white/15 hover:text-white"
                  >
                    in
                  </a>
                )}
                {c.instagram && (
                  <a
                    href={c.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="grid h-9 w-9 place-items-center rounded-full bg-white/8 text-white/80 ring-1 ring-white/15 transition hover:bg-white/15 hover:text-white"
                  >
                    <IconInstagram className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="relative mt-6 border-t border-white/10 pt-5 text-center">
          <p className="text-xs text-white/45">Want to get in touch?</p>
          <div className="mt-3 inline-flex max-w-full items-center gap-2 rounded-full border border-white/12 bg-black/30 py-1.5 pl-4 pr-1.5">
            <span className="truncate text-xs text-white/75">{email}</span>
            <button
              onClick={doCopy}
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold tracking-wider text-white/85 transition hover:bg-white/20 active:scale-95"
            >
              {copied ? (
                <IconCheck className="h-3 w-3 text-goldsoft" />
              ) : (
                <IconCopy className="h-3 w-3" strokeWidth={2.2} />
              )}
              {copied ? "COPIED" : "COPY"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
