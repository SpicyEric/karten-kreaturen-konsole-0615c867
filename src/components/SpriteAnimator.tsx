import { useEffect, useMemo, useState } from "react";

interface SpriteAnimatorProps {
  src: string;
  frameCount: number;
  frameSize: number;
  fps: number;
  loop?: boolean;
  /** Optional display scale (1 = native size). */
  scale?: number;
  /** Re-mount key to restart non-looping animations. */
  playKey?: string | number;
  className?: string;
}

/**
 * Pure-CSS sprite sheet player.
 * Sheet must be a horizontal strip: width = frameCount * frameSize, height = frameSize.
 */
export default function SpriteAnimator({
  src,
  frameCount,
  frameSize,
  fps,
  loop = true,
  scale = 1,
  playKey,
  className,
}: SpriteAnimatorProps) {
  const animName = useMemo(() => `sprite_${Math.random().toString(36).slice(2)}`, [playKey, src, frameCount, frameSize, fps, loop]);
  const [styleEl, setStyleEl] = useState<HTMLStyleElement | null>(null);

  useEffect(() => {
    const el = document.createElement("style");
    el.innerHTML = `@keyframes ${animName} {
      from { background-position: 0px 0px; }
      to   { background-position: -${frameCount * frameSize}px 0px; }
    }`;
    document.head.appendChild(el);
    setStyleEl(el);
    return () => { el.remove(); };
  }, [animName, frameCount, frameSize]);

  if (!src || !frameCount || frameCount < 1) {
    return (
      <div
        className={className}
        style={{
          width: frameSize * scale,
          height: frameSize * scale,
          background: "hsl(var(--muted))",
          borderRadius: 8,
        }}
      />
    );
  }

  const durationSec = frameCount / Math.max(1, fps);

  return (
    <div
      className={className}
      style={{
        width: frameSize * scale,
        height: frameSize * scale,
        overflow: "hidden",
        imageRendering: "pixelated",
      }}
    >
      <div
        key={`${animName}-${playKey ?? ""}`}
        style={{
          width: frameSize,
          height: frameSize,
          backgroundImage: `url(${src})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: `${frameCount * frameSize}px ${frameSize}px`,
          animation: `${animName} ${durationSec}s steps(${frameCount}) ${loop ? "infinite" : "1 forwards"}`,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
}
