import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Nfc, RotateCcw } from "lucide-react";
import AppLayout from "@/components/app/AppLayout";
import SpawnAnimation from "@/components/app/SpawnAnimation";
import SpriteAnimator from "@/components/SpriteAnimator";
import TypeBadge from "@/components/admin/TypeBadge";
import RarityBadge from "@/components/admin/RarityBadge";
import { useNfcScanner } from "@/hooks/useNfcScanner";
import { LoadedCreature, calcHp } from "@/lib/creature-helpers";
import { FORM_LABELS, KIND_ICONS, KIND_LABELS, TIER_LABELS } from "@/lib/constants";
import bgLab from "@/assets/bg-lab.webp";

export default function AppAnalyse() {
  const navigate = useNavigate();
  const [creature, setCreature] = useState<LoadedCreature | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [playKey, setPlayKey] = useState(0);

  const onScan = useCallback(async (uid: string) => {
    const { data: card, error } = await supabase
      .from("nfc_cards")
      .select("*, creatures(*), card_instances(*)")
      .eq("uid", uid)
      .maybeSingle();

    if (error) { toast.error("Fehler: " + error.message); return; }
    if (!card || !card.creatures) { toast.error("Karte nicht registriert"); return; }

    const instance = Array.isArray(card.card_instances) ? card.card_instances[0] : card.card_instances;
    const cr: any = card.creatures;

    const skillIds: string[] = instance?.unlocked_skills ?? [];
    let unlocked: LoadedCreature["unlocked_skills"] = [];
    if (skillIds.length > 0) {
      const { data: skills } = await supabase
        .from("skills")
        .select("id, name, type, kind, tier, cooldown_turns")
        .in("id", skillIds);
      unlocked = (skills ?? []) as any;
    }

    const loaded: LoadedCreature = {
      cardUid: uid,
      cardId: card.id,
      instanceId: instance?.id ?? "",
      creatureId: cr.id,
      name: cr.name,
      description: cr.description,
      type: cr.type,
      rarity: cr.rarity,
      form: cr.form,
      base_strength: cr.base_strength,
      base_speed: cr.base_speed,
      base_intelligence: cr.base_intelligence,
      max_skill_points: cr.max_skill_points,
      current_skill_points: instance?.current_skill_points ?? 0,
      skill_points: instance?.skill_points ?? 0,
      battles_fought: instance?.battles_fought ?? 0,
      training_sessions: instance?.training_sessions ?? 0,
      sprite_idle_url: cr.sprite_idle_url,
      sprite_idle_frames: cr.sprite_idle_frames,
      sprite_attack_url: cr.sprite_attack_url,
      sprite_attack_frames: cr.sprite_attack_frames,
      sprite_hit_url: cr.sprite_hit_url,
      sprite_hit_frames: cr.sprite_hit_frames,
      sprite_die_url: cr.sprite_die_url,
      sprite_die_frames: cr.sprite_die_frames,
      sprite_frame_size: cr.sprite_frame_size ?? 64,
      sprite_fps: cr.sprite_fps ?? 8,
      unlocked_skills: unlocked,
    };

    setRevealed(false);
    setPlayKey((k) => k + 1);
    setCreature(loaded);
    stop();
  }, []); // eslint-disable-line

  const { scanning, error, start, stop } = useNfcScanner(onScan);

  const reset = () => {
    setCreature(null);
    setRevealed(false);
  };

  const hp = creature ? calcHp(creature) : null;

  return (
    <AppLayout bgImage={bgLab} overlay={creature ? 0.55 : 0.45}>
      {/* Header */}
      <div className="relative z-20 flex items-center justify-between px-4 pt-4">
        <button
          onClick={() => navigate("/app")}
          className="p-2 rounded-lg bg-black/40 backdrop-blur text-white"
          aria-label="Zurück"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-mono text-lg font-bold text-white drop-shadow">Analysemodul</h1>
        {creature ? (
          <button
            onClick={reset}
            className="p-2 rounded-lg bg-black/40 backdrop-blur text-white"
            aria-label="Neu scannen"
          >
            <RotateCcw size={18} />
          </button>
        ) : <div className="w-9" />}
      </div>

      {!creature && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-8">
          <div className="relative">
            <div className={`w-40 h-40 rounded-full border-4 border-cyan-300/70 flex items-center justify-center bg-black/30 backdrop-blur ${scanning ? "animate-pulse" : ""}`}>
              <Nfc size={72} className="text-cyan-200" />
            </div>
            {scanning && <div className="absolute inset-0 rounded-full border-4 border-cyan-300 animate-ping" />}
          </div>
          <p className="text-sm text-white/90 max-w-[300px] font-mono">
            Halte eine Kreaturenkarte ans Gerät – sie wird sofort analysiert.
          </p>
          <Button onClick={scanning ? stop : start} size="lg" className="min-h-[56px] px-10 gap-2">
            <Nfc size={22} />
            {scanning ? "Scan abbrechen" : "Karte scannen"}
          </Button>
          {error && <p className="text-xs text-destructive max-w-[300px]">{error}</p>}
        </div>
      )}

      {creature && (
        <div className="flex-1 flex flex-col">
          {/* Fullscreen creature stage */}
          <div className="relative w-full" style={{ height: "55vh" }}>
            <div className="absolute inset-0 flex items-end justify-center pb-4">
              {creature.sprite_idle_url && creature.sprite_idle_frames && (
                <div
                  className={`transition-opacity duration-500 ${revealed ? "opacity-100" : "opacity-0"}`}
                >
                  <SpriteAnimator
                    src={creature.sprite_idle_url}
                    frameCount={creature.sprite_idle_frames}
                    frameSize={creature.sprite_frame_size}
                    fps={creature.sprite_fps}
                    loop
                    scale={6}
                  />
                </div>
              )}
            </div>
            {/* Spawn-Animation overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <SpawnAnimation
                playKey={playKey}
                onReveal={() => setRevealed(true)}
                className="w-[90vw] max-w-[520px] h-auto"
              />
            </div>
          </div>

          {/* Stats panel */}
          <div className="bg-black/70 backdrop-blur-md border-t border-cyan-400/30 px-4 py-4 space-y-3 max-h-[55vh] overflow-y-auto">
            <div className="text-center">
              <h2 className="font-mono text-2xl font-extrabold text-white">{creature.name}</h2>
              {creature.description && (
                <p className="text-xs text-white/70 mt-1">{creature.description}</p>
              )}
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                <TypeBadge type={creature.type} />
                <RarityBadge rarity={creature.rarity} />
                <span className="text-xs bg-white/10 text-white px-2 py-0.5 rounded">
                  {FORM_LABELS[creature.form]}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "STR", value: creature.base_strength },
                { label: "SPD", value: creature.base_speed },
                { label: "INT", value: creature.base_intelligence },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white/5 border border-white/10 rounded-lg p-2 text-center">
                  <div className="text-[10px] text-white/60 font-mono">{label}</div>
                  <div className="text-xl font-bold font-mono text-cyan-300">{value}</div>
                </div>
              ))}
            </div>

            {hp && (
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/5 border border-white/10 rounded-lg p-2 text-center">
                  <div className="text-[10px] text-white/60 font-mono">LEBEN</div>
                  <div className="text-lg font-bold font-mono text-white">{hp.current} / {hp.max}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-2 text-center">
                  <div className="text-[10px] text-white/60 font-mono">SKILL POINTS</div>
                  <div className="text-lg font-bold font-mono text-amber-300">{hp.currentSp} / {hp.maxSp}</div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-center text-[11px] font-mono text-white/70">
              <div>Kämpfe: <span className="text-white">{creature.battles_fought}</span></div>
              <div>Training: <span className="text-white">{creature.training_sessions}</span></div>
            </div>

            <div>
              <h3 className="font-mono text-[11px] text-white/70 uppercase tracking-wider mb-1">Fähigkeiten</h3>
              {creature.unlocked_skills.length === 0 ? (
                <p className="text-xs text-white/50 italic">Keine Fähigkeiten freigeschaltet.</p>
              ) : (
                <div className="space-y-1">
                  {creature.unlocked_skills.map((s) => (
                    <div key={s.id} className="bg-white/5 border border-white/10 rounded-lg p-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base">{KIND_ICONS[s.kind] ?? "•"}</span>
                        <div className="min-w-0">
                          <div className="font-mono text-sm font-bold text-white truncate">{s.name}</div>
                          <div className="text-[10px] text-white/60 font-mono">
                            {KIND_LABELS[s.kind]} · {TIER_LABELS[s.tier] ?? s.tier}
                          </div>
                        </div>
                      </div>
                      {s.cooldown_turns > 0 && (
                        <span className="text-[10px] font-mono bg-white/10 text-white px-2 py-0.5 rounded shrink-0">
                          CD {s.cooldown_turns}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <p className="text-center text-[10px] font-mono text-white/40 pt-1">
              UID: {creature.cardUid}
            </p>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
