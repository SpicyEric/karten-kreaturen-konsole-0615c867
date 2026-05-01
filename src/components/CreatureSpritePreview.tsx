import { useState } from "react";
import SpriteAnimator from "./SpriteAnimator";
import { Button } from "./ui/button";

type Anim = "idle" | "attack" | "hit" | "die";

interface CreatureSprites {
  sprite_frame_size?: number | null;
  sprite_fps?: number | null;
  sprite_idle_url?: string | null;
  sprite_idle_frames?: number | null;
  sprite_attack_url?: string | null;
  sprite_attack_frames?: number | null;
  sprite_hit_url?: string | null;
  sprite_hit_frames?: number | null;
  sprite_die_url?: string | null;
  sprite_die_frames?: number | null;
}

const LABELS: Record<Anim, string> = {
  idle: "Idle",
  attack: "Angriff",
  hit: "Schaden",
  die: "Sterben",
};

export default function CreatureSpritePreview({
  creature,
  scale = 2,
}: {
  creature: CreatureSprites;
  scale?: number;
}) {
  const [current, setCurrent] = useState<Anim>("idle");
  const [playKey, setPlayKey] = useState(0);

  const frameSize = creature.sprite_frame_size ?? 64;
  const fps = creature.sprite_fps ?? 8;

  const slots: Record<Anim, { url?: string | null; frames?: number | null; loop: boolean }> = {
    idle:   { url: creature.sprite_idle_url,   frames: creature.sprite_idle_frames,   loop: true },
    attack: { url: creature.sprite_attack_url, frames: creature.sprite_attack_frames, loop: false },
    hit:    { url: creature.sprite_hit_url,    frames: creature.sprite_hit_frames,    loop: false },
    die:    { url: creature.sprite_die_url,    frames: creature.sprite_die_frames,    loop: false },
  };

  const active = slots[current];
  const fallback = slots.idle;
  const url = active.url || fallback.url;
  const frames = (active.url ? active.frames : fallback.frames) ?? 0;
  const loop = active.url ? active.loop : true;

  const hasAny = !!(slots.idle.url || slots.attack.url || slots.hit.url || slots.die.url);

  const play = (a: Anim) => {
    setCurrent(a);
    setPlayKey(k => k + 1);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-center bg-muted/40 rounded-lg p-3">
        {hasAny && url && frames > 0 ? (
          <SpriteAnimator
            src={url}
            frameCount={frames}
            frameSize={frameSize}
            fps={fps}
            loop={loop}
            scale={scale}
            playKey={`${current}-${playKey}`}
          />
        ) : (
          <div
            style={{ width: frameSize * scale, height: frameSize * scale }}
            className="rounded-lg bg-secondary flex items-center justify-center text-muted-foreground text-xs font-mono"
          >
            kein Sprite
          </div>
        )}
      </div>
      <div className="grid grid-cols-4 gap-1">
        {(Object.keys(LABELS) as Anim[]).map(a => (
          <Button
            key={a}
            size="sm"
            variant={current === a ? "default" : "secondary"}
            onClick={() => play(a)}
            className="text-xs"
            disabled={!slots[a].url}
          >
            {LABELS[a]}
          </Button>
        ))}
      </div>
    </div>
  );
}
