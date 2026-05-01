import { useEffect, useState } from "react";
import f1 from "@/assets/spawn/frame0001.png";
import f2 from "@/assets/spawn/frame0002.png";
import f3 from "@/assets/spawn/frame0003.png";
import f4 from "@/assets/spawn/frame0004.png";
import f5 from "@/assets/spawn/frame0005.png";
import f6 from "@/assets/spawn/frame0006.png";
import f7 from "@/assets/spawn/frame0007.png";

const FRAMES = [f1, f2, f3, f4, f5, f6, f7];
const FPS = 8;
const FRAME_MS = 1000 / FPS;
// Ab welchem Frame (0-indexed) die Kreatur dahinter sichtbar wird
const REVEAL_FRAME = 1; // entspricht "Frame 2"

interface Props {
  /** Sichtbarkeit der Kreatur dahinter steuern (true = sichtbar) */
  onReveal?: () => void;
  /** Wird nach dem letzten Frame aufgerufen */
  onDone?: () => void;
  /** Re-Trigger der Animation */
  playKey?: string | number;
  className?: string;
}

export default function SpawnAnimation({ onReveal, onDone, playKey, className }: Props) {
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setIdx(0);
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      if (i >= FRAMES.length) {
        clearInterval(interval);
        setDone(true);
        onDone?.();
        return;
      }
      setIdx(i);
      if (i === REVEAL_FRAME) onReveal?.();
    }, FRAME_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playKey]);

  if (done) return null;

  return (
    <img
      src={FRAMES[idx]}
      alt=""
      aria-hidden
      className={className}
      style={{
        imageRendering: "pixelated",
        pointerEvents: "none",
      }}
    />
  );
}
