"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { IconMusic } from "./Icons";

export function Cover({
  src,
  alt = "",
  className,
  iconClass,
  children,
}: {
  src?: string | null;
  alt?: string;
  className?: string;
  iconClass?: string;
  children?: React.ReactNode;
}) {
  const [err, setErr] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (!src || err) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#40301b] via-[#241a10] to-[#120d08]",
          className,
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(233,180,76,0.25),transparent_60%)]" />
        <IconMusic className={cn("relative text-gold/50", iconClass ?? "h-1/3 w-1/3")} strokeWidth={1.6} />
        {children}
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden bg-[#1a140d]", className)}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setErr(true)}
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
        )}
      />
      {children}
    </div>
  );
}
