import { LoadedCreature, calcHp } from "@/lib/creature-helpers";
import SpriteAnimator from "@/components/SpriteAnimator";
import TypeBadge from "@/components/admin/TypeBadge";
import RarityBadge from "@/components/admin/RarityBadge";
import { KIND_ICONS, KIND_LABELS, TIER_LABELS } from "@/lib/constants";

export default function CreatureDetail({ creature }: { creature: LoadedCreature }) {
  const hp = calcHp(creature);
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-b from-card/80 to-card/30 border border-border/60 rounded-2xl p-4 flex flex-col items-center">
        <div className="h-40 flex items-center justify-center">
          {creature.sprite_idle_url && creature.sprite_idle_frames ? (
            <SpriteAnimator
              src={creature.sprite_idle_url}
              frameCount={creature.sprite_idle_frames}
              frameSize={creature.sprite_frame_size}
              fps={creature.sprite_fps}
              loop
              scale={2.5}
            />
          ) : (
            <div className="w-32 h-32 bg-muted rounded text-xs text-muted-foreground flex items-center justify-center font-mono">
              kein Sprite
            </div>
          )}
        </div>
        <h2 className="font-mono text-2xl font-bold mt-2">{creature.name}</h2>
        <div className="flex flex-wrap gap-2 justify-center mt-2">
          <TypeBadge type={creature.type} />
          <RarityBadge rarity={creature.rarity} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "STR", value: creature.base_strength },
          { label: "SPD", value: creature.base_speed },
          { label: "INT", value: creature.base_intelligence },
        ].map(({ label, value }) => (
          <div key={label} className="bg-card/60 border border-border/40 rounded-lg p-3 text-center">
            <div className="text-[10px] text-muted-foreground font-mono">{label}</div>
            <div className="text-xl font-bold font-mono text-primary">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-card/60 border border-border/40 rounded-lg p-3 text-center">
          <div className="text-[10px] text-muted-foreground font-mono">LEBEN</div>
          <div className="text-lg font-bold font-mono text-foreground">{hp.current} / {hp.max}</div>
        </div>
        <div className="bg-card/60 border border-border/40 rounded-lg p-3 text-center">
          <div className="text-[10px] text-muted-foreground font-mono">SKILL POINTS</div>
          <div className="text-lg font-bold font-mono text-accent">{hp.currentSp} / {hp.maxSp}</div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-mono text-sm text-muted-foreground uppercase tracking-wider">Fähigkeiten</h3>
        {creature.unlocked_skills.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">Keine Fähigkeiten freigeschaltet.</p>
        ) : (
          <div className="space-y-1.5">
            {creature.unlocked_skills.map((s) => (
              <div key={s.id} className="bg-card/60 border border-border/40 rounded-lg p-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg">{KIND_ICONS[s.kind] ?? "•"}</span>
                  <div className="min-w-0">
                    <div className="font-mono text-sm font-bold truncate">{s.name}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      {KIND_LABELS[s.kind]} · {TIER_LABELS[s.tier] ?? s.tier}
                    </div>
                  </div>
                </div>
                {s.cooldown_turns > 0 && (
                  <span className="text-[10px] font-mono bg-muted px-2 py-0.5 rounded shrink-0">
                    CD {s.cooldown_turns}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-mono text-muted-foreground">
        <div>Kämpfe: <span className="text-foreground">{creature.battles_fought}</span></div>
        <div>Training: <span className="text-foreground">{creature.training_sessions}</span></div>
      </div>
    </div>
  );
}
