import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Plus, Sparkles, Swords, X } from "lucide-react";
import AppLayout from "@/components/app/AppLayout";
import SpawnAnimation from "@/components/app/SpawnAnimation";
import SpriteAnimator from "@/components/SpriteAnimator";
import { LoadedCreature } from "@/lib/creature-helpers";
import { useNfcScanner } from "@/hooks/useNfcScanner";
import bgArena from "@/assets/bg-arena.jpg";

const MAX_SLOTS = 3;

interface SlotState {
  creature: LoadedCreature;
  revealed: boolean;
  playKey: number;
}

export default function AppTraining() {
  const navigate = useNavigate();
  const [slots, setSlots] = useState<SlotState[]>([]);
  const [error2, setError2] = useState<string | null>(null);

  const loadByUid = useCallback(async (uid: string) => {
    if (slots.some((s) => s.creature.cardUid === uid)) {
      toast.info("Diese Kreatur ist bereits in der Halle");
      return;
    }
    if (slots.length >= MAX_SLOTS) {
      toast.error("Halle ist voll – maximal 3 Kreaturen");
      return;
    }

    const { data: card, error } = await supabase
      .from("nfc_cards")
      .select("*, creatures(*), card_instances(*)")
      .eq("uid", uid)
      .maybeSingle();

    if (error) { toast.error("Fehler: " + error.message); return; }
    if (!card || !card.creatures) { toast.error("Karte nicht registriert"); return; }

    const instance = Array.isArray(card.card_instances) ? card.card_instances[0] : card.card_instances;
    const cr: any = card.creatures;

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
      unlocked_skills: [],
    };

    setSlots((prev) => [
      ...prev,
      { creature: loaded, revealed: false, playKey: Date.now() },
    ]);
    toast.success(`${loaded.name} erschienen!`);
  }, [slots]);

  const { scanning, error, start, stop } = useNfcScanner(loadByUid);

  const removeSlot = (uid: string) => {
    setSlots((prev) => prev.filter((s) => s.creature.cardUid !== uid));
  };

  const setRevealed = (uid: string) => {
    setSlots((prev) =>
      prev.map((s) => (s.creature.cardUid === uid ? { ...s, revealed: true } : s))
    );
  };

  const isFull = slots.length >= MAX_SLOTS;

  return (
    <AppLayout bgImage={bgArena} overlay={0.4}>
      {/* Header */}
      <div className="relative z-20 flex items-center justify-between px-4 pt-4">
        <button
          onClick={() => navigate("/app")}
          className="p-2 rounded-lg bg-black/40 backdrop-blur text-white"
          aria-label="Zurück"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-mono text-lg font-bold text-white drop-shadow">Trainingshalle</h1>
        <div className="w-9" />
      </div>

      {/* Names list */}
      <div className="relative z-10 px-4 pt-2">
        <div className="flex items-center justify-center gap-2 flex-wrap min-h-[28px]">
          {slots.length === 0 ? (
            <span className="text-xs font-mono text-white/70 drop-shadow">
              Noch keine Kreaturen in der Halle
            </span>
          ) : (
            slots.map((s, i) => (
              <span
                key={s.creature.cardUid}
                className="inline-flex items-center gap-1 bg-black/50 backdrop-blur border border-white/20 text-white text-xs font-mono px-3 py-1 rounded-full"
              >
                <span className="text-amber-300">#{i + 1}</span>
                {s.creature.name}
                <button
                  onClick={() => removeSlot(s.creature.cardUid)}
                  className="ml-1 text-white/60 hover:text-white"
                  aria-label={`${s.creature.name} entfernen`}
                >
                  <X size={12} />
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      {/* Stage – creatures stand side by side, slightly overlapping */}
      <div className="flex-1 relative flex items-end justify-center pb-44 pt-4">
        {slots.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <div className="text-center max-w-[300px] space-y-4">
              <p className="font-mono text-sm text-white/90 drop-shadow">
                Halte eine Kreaturenkarte ans Gerät, um deine erste Kreatur zu spawnen.
              </p>
            </div>
          </div>
        ) : (
          <div
            className="flex items-end justify-center"
            style={{ gap: slots.length === 3 ? "-20px" : "12px" }}
          >
            {slots.map((s, i) => (
              <div
                key={s.creature.cardUid}
                className="relative"
                style={{
                  marginLeft: i === 0 ? 0 : -28,
                  zIndex: 10 + i,
                }}
              >
                {/* Sprite */}
                {s.creature.sprite_idle_url && s.creature.sprite_idle_frames && (
                  <div
                    className={`transition-opacity duration-500 ${s.revealed ? "opacity-100" : "opacity-0"}`}
                  >
                    <SpriteAnimator
                      src={s.creature.sprite_idle_url}
                      frameCount={s.creature.sprite_idle_frames}
                      frameSize={s.creature.sprite_frame_size}
                      fps={s.creature.sprite_fps}
                      loop
                      scale={4}
                    />
                  </div>
                )}
                {/* Spawn animation overlay (centered on sprite) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <SpawnAnimation
                    playKey={s.playKey}
                    onReveal={() => setRevealed(s.creature.cardUid)}
                    className="w-[260px] h-[260px]"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 px-4 pt-6 pb-5 bg-gradient-to-t from-black/85 via-black/60 to-transparent">
        <div className="max-w-md mx-auto space-y-3">
          {error && <p className="text-xs text-destructive text-center">{error}</p>}
          <div className="flex gap-2">
            <Button
              onClick={scanning ? stop : start}
              disabled={isFull}
              size="lg"
              className="flex-1 min-h-[52px] gap-2 font-mono font-bold"
            >
              <Sparkles size={20} />
              {isFull ? "Halle voll" : scanning ? "Scan abbrechen" : "Kreatur spawnen"}
            </Button>
          </div>
          <Button
            onClick={() => navigate("/app/kampf")}
            disabled={slots.length === 0}
            variant="secondary"
            size="lg"
            className="w-full min-h-[52px] gap-2 font-mono font-bold"
          >
            <Swords size={20} />
            Training starten
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
