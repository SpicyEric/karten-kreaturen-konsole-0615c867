import { LoadedCreature, calcHp } from "@/lib/creature-helpers";
import SpriteAnimator from "@/components/SpriteAnimator";

export default function CreatureSlot({
  creature,
  selected,
  onClick,
}: {
  creature: LoadedCreature;
  selected: boolean;
  onClick: () => void;
}) {
  const hp = calcHp(creature);
  const pct = Math.max(0, Math.min(100, (hp.current / Math.max(1, hp.max)) * 100));
  return (
    <button
      onClick={onClick}
      className={`relative flex-1 min-h-[88px] rounded-xl border-2 p-2 transition-all flex flex-col items-center gap-1 ${
        selected
          ? "border-primary bg-primary/10 shadow-[0_0_20px_-4px_hsl(var(--primary)/0.6)]"
          : "border-border/60 bg-card/60"
      }`}
    >
      <div className="h-12 flex items-center justify-center">
        {creature.sprite_idle_url && creature.sprite_idle_frames ? (
          <SpriteAnimator
            src={creature.sprite_idle_url}
            frameCount={creature.sprite_idle_frames}
            frameSize={creature.sprite_frame_size}
            fps={creature.sprite_fps}
            loop
            scale={0.75}
          />
        ) : (
          <div className="w-12 h-12 bg-muted rounded text-[10px] text-muted-foreground flex items-center justify-center">?</div>
        )}
      </div>
      <div className="text-[11px] font-mono font-bold truncate w-full text-center">{creature.name}</div>
      <div className="w-full h-1.5 bg-muted rounded overflow-hidden">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-[9px] font-mono text-muted-foreground">
        SP {hp.currentSp}/{hp.maxSp}
      </div>
    </button>
  );
}
