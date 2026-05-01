import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Hintergrundbild URL (importiertes Asset) */
  bgImage?: string;
  /** Dunkler Overlay (0..1), default 0.55 */
  overlay?: number;
}

export default function AppLayout({ children, bgImage, overlay = 0.55 }: Props) {
  return (
    <div className="relative min-h-screen text-foreground overflow-hidden">
      {bgImage && (
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{ backgroundImage: `url(${bgImage})` }}
          aria-hidden
        />
      )}
      {bgImage && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: `rgba(5, 8, 14, ${overlay})` }}
          aria-hidden
        />
      )}
      {!bgImage && <div className="absolute inset-0 bg-[#0a0a0f]" aria-hidden />}
      <div className="relative z-10 min-h-screen flex flex-col">{children}</div>
    </div>
  );
}
