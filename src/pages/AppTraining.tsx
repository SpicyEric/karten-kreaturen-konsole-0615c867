import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Nfc, Plus, Swords } from "lucide-react";
import AppLayout from "@/components/app/AppLayout";
import CreatureSlot from "@/components/app/CreatureSlot";
import CreatureDetail from "@/components/app/CreatureDetail";
import { LoadedCreature } from "@/lib/creature-helpers";
import { useNfcScanner } from "@/hooks/useNfcScanner";

const MAX_SLOTS = 3;

export default function AppTraining() {
  const navigate = useNavigate();
  const [slots, setSlots] = useState<LoadedCreature[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const loadByUid = useCallback(
    async (uid: string) => {
      if (slots.some((s) => s.cardUid === uid)) {
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

      if (error) {
        toast.error("Fehler: " + error.message);
        return;
      }
      if (!card || !card.creatures) {
        toast.error("Karte nicht registriert");
        return;
      }
      const instance = Array.isArray(card.card_instances) ? card.card_instances[0] : card.card_instances;
      const creature: any = card.creatures;

      // Skills laden
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
        creatureId: creature.id,
        name: creature.name,
        description: creature.description,
        type: creature.type,
        rarity: creature.rarity,
        form: creature.form,
        base_strength: creature.base_strength,
        base_speed: creature.base_speed,
        base_intelligence: creature.base_intelligence,
        max_skill_points: creature.max_skill_points,
        current_skill_points: instance?.current_skill_points ?? 0,
        skill_points: instance?.skill_points ?? 0,
        battles_fought: instance?.battles_fought ?? 0,
        training_sessions: instance?.training_sessions ?? 0,
        sprite_idle_url: creature.sprite_idle_url,
        sprite_idle_frames: creature.sprite_idle_frames,
        sprite_attack_url: creature.sprite_attack_url,
        sprite_attack_frames: creature.sprite_attack_frames,
        sprite_hit_url: creature.sprite_hit_url,
        sprite_hit_frames: creature.sprite_hit_frames,
        sprite_die_url: creature.sprite_die_url,
        sprite_die_frames: creature.sprite_die_frames,
        sprite_frame_size: creature.sprite_frame_size ?? 64,
        sprite_fps: creature.sprite_fps ?? 8,
        unlocked_skills: unlocked,
      };

      setSlots((prev) => {
        const next = [...prev, loaded];
        setSelectedIdx(next.length - 1);
        return next;
      });
      toast.success(`${loaded.name} eingescannt!`);
    },
    [slots]
  );

  const { scanning, error, start, stop } = useNfcScanner(loadByUid);

  const isFull = slots.length >= MAX_SLOTS;
  const selected = slots[selectedIdx];

  return (
    <AppLayout>
      <div className="px-4 pt-6 pb-4 max-w-md mx-auto space-y-5">
        <header className="text-center">
          <h1 className="font-mono text-2xl font-bold text-primary">Trainingshalle</h1>
          <p className="text-xs text-muted-foreground mt-1">
            {slots.length} / {MAX_SLOTS} Kreaturen bereit
          </p>
        </header>

        {slots.length === 0 ? (
          <div className="flex flex-col items-center text-center py-10 space-y-6">
            <div className="relative">
              <div
                className={`w-32 h-32 rounded-full border-2 border-primary/40 flex items-center justify-center ${
                  scanning ? "animate-ping-slow" : ""
                }`}
              >
                <Nfc size={56} className="text-primary" />
              </div>
              {scanning && (
                <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping" />
              )}
            </div>
            <p className="text-sm text-muted-foreground max-w-[280px]">
              Halte eine NFC Karte ans Gerät um eine Kreatur einzuscannen
            </p>
            <Button
              onClick={scanning ? stop : start}
              size="lg"
              className="min-h-[52px] px-8 gap-2"
            >
              <Nfc size={20} />
              {scanning ? "Scan abbrechen" : "NFC Scan starten"}
            </Button>
            {error && (
              <p className="text-xs text-destructive max-w-[300px]">{error}</p>
            )}
          </div>
        ) : (
          <>
            {selected && <CreatureDetail creature={selected} />}

            {!isFull && (
              <Button
                onClick={scanning ? stop : start}
                variant="secondary"
                className="w-full min-h-[48px] gap-2"
              >
                <Plus size={18} />
                {scanning ? "Scan abbrechen" : "Weitere Kreatur scannen"}
              </Button>
            )}

            {error && (
              <p className="text-xs text-destructive text-center">{error}</p>
            )}
          </>
        )}
      </div>

      {/* Bottom-fixed action zone */}
      {slots.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f] to-transparent pt-6 pb-3 px-4 z-30">
          <div className="max-w-md mx-auto space-y-3">
            <div className="flex gap-2">
              {Array.from({ length: MAX_SLOTS }).map((_, i) => {
                const c = slots[i];
                if (!c) {
                  return (
                    <button
                      key={i}
                      onClick={scanning ? stop : start}
                      className="flex-1 min-h-[88px] rounded-xl border-2 border-dashed border-border/50 flex items-center justify-center text-muted-foreground hover:border-primary/50 hover:text-primary transition"
                    >
                      <Plus size={22} />
                    </button>
                  );
                }
                return (
                  <CreatureSlot
                    key={c.cardUid}
                    creature={c}
                    selected={selectedIdx === i}
                    onClick={() => setSelectedIdx(i)}
                  />
                );
              })}
            </div>
            <Button
              onClick={() => navigate("/app/kampf")}
              disabled={slots.length === 0}
              size="lg"
              className="w-full min-h-[52px] gap-2 font-mono font-bold"
            >
              <Swords size={20} />
              Training starten
            </Button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
