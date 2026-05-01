import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import TypeBadge from "./TypeBadge";
import RarityBadge from "./RarityBadge";
import SpriteAnimator from "@/components/SpriteAnimator";
import { RotateCcw, Trash2, Nfc } from "lucide-react";

export default function NfcCardManager() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get("creatureId");
  const [uid, setUid] = useState("");
  const [creatureId, setCreatureId] = useState(preselectedId || "");

  useEffect(() => {
    if (preselectedId) setCreatureId(preselectedId);
  }, [preselectedId]);

  const { data: creatures } = useQuery({
    queryKey: ["creatures"],
    queryFn: async () => {
      const { data, error } = await supabase.from("creatures").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: cards, isLoading } = useQuery({
    queryKey: ["nfc-cards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nfc_cards")
        .select("*, creatures(*), card_instances(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Wählt 2 Start-Skills: 1x Stein-Angriff (garantiert) + 1x beliebig (random aus allen Skills)
  const pickStarterSkills = async (): Promise<string[]> => {
    const { data: steinAttacks, error: e1 } = await supabase
      .from("skills")
      .select("id")
      .eq("type", "stein")
      .eq("kind", "attack");
    if (e1) throw e1;
    if (!steinAttacks || steinAttacks.length === 0) {
      throw new Error("Keine Stein-Angriffsskills gefunden – bitte zuerst Skills anlegen.");
    }
    const stein = steinAttacks[Math.floor(Math.random() * steinAttacks.length)].id;

    const { data: allSkills, error: e2 } = await supabase
      .from("skills")
      .select("id")
      .neq("id", stein);
    if (e2) throw e2;
    const pool = allSkills ?? [];
    const second = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)].id : null;

    return second ? [stein, second] : [stein];
  };

  const registerMutation = useMutation({
    mutationFn: async () => {
      const { data: card, error: cardError } = await supabase
        .from("nfc_cards")
        .insert({ uid: uid.trim().toUpperCase(), creature_id: creatureId })
        .select()
        .single();
      if (cardError) throw cardError;

      const starters = await pickStarterSkills();

      const { error: instanceError } = await supabase
        .from("card_instances")
        .insert({
          nfc_card_id: card.id,
          creature_id: creatureId,
          unlocked_skills: starters,
          active_skills: starters,
        });
      if (instanceError) throw instanceError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nfc-cards"] });
      toast.success("NFC Karte registriert! 2 Start-Skills zugewiesen.");
      setUid(""); setCreatureId("");
    },
    onError: (e) => toast.error("Fehler: " + e.message),
  });

  const resetMutation = useMutation({
    mutationFn: async (cardId: string) => {
      const card = cards?.find((c) => c.id === cardId);
      if (!card) return;
      await supabase.from("card_instances").delete().eq("nfc_card_id", cardId);
      const starters = await pickStarterSkills();
      await supabase.from("card_instances").insert({
        nfc_card_id: cardId,
        creature_id: card.creature_id,
        unlocked_skills: starters,
        active_skills: starters,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nfc-cards"] });
      toast.success("Karten-Instanz zurückgesetzt – neue Start-Skills vergeben!");
    },
    onError: (e) => toast.error("Fehler: " + e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("nfc_cards").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nfc-cards"] });
      toast.success("Karte gelöscht!");
    },
    onError: (e) => toast.error("Fehler: " + e.message),
  });

  const selectedCreature = creatures?.find((c) => c.id === creatureId);
  const [scanning, setScanning] = useState(false);
  const [scanAbort, setScanAbort] = useState<AbortController | null>(null);

  const startNfcScan = async () => {
    if (!("NDEFReader" in window)) {
      toast.error("Web NFC wird auf diesem Gerät/Browser nicht unterstützt. Nutze Chrome auf Android.");
      return;
    }
    try {
      setScanning(true);
      const controller = new AbortController();
      setScanAbort(controller);
      const ndef = new (window as any).NDEFReader();
      await ndef.scan({ signal: controller.signal });
      toast.info("Halte eine NFC-Karte an dein Gerät...");

      ndef.addEventListener(
        "reading",
        (event: any) => {
          // Verhindert, dass Chrome bei leeren Tags die "leeres Tag"-UI zeigt
          if (typeof event.preventDefault === "function") event.preventDefault();
          const scanned = String(event.serialNumber || "").toUpperCase();
          if (!scanned) {
            toast.error("Karte hat keine lesbare UID.");
            return;
          }
          setUid(scanned);
          setScanning(false);
          toast.success("UID gelesen: " + scanned);
          // Scan sauber beenden, damit kein weiteres Tag-Event aufpoppt
          controller.abort();
          setScanAbort(null);
        },
        { signal: controller.signal }
      );

      ndef.addEventListener(
        "readingerror",
        () => {
          toast.error("Fehler beim Lesen – Karte erneut anhalten.");
        },
        { signal: controller.signal }
      );
    } catch (e: any) {
      setScanning(false);
      setScanAbort(null);
      if (e?.name !== "AbortError") {
        toast.error("NFC Scan fehlgeschlagen: " + e.message);
      }
    }
  };

  const cancelNfcScan = () => {
    scanAbort?.abort();
    setScanAbort(null);
    setScanning(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="font-mono text-xl font-bold">NFC Karte registrieren</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>NFC UID</Label>
          <div className="flex gap-2">
            <Input
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              placeholder="z.B. 04:A3:B2:C1:D4:E5:F6"
              className="font-mono"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={scanning ? cancelNfcScan : startNfcScan}
              title={scanning ? "Scan abbrechen" : "NFC-Karte scannen"}
            >
              <Nfc size={16} className="mr-1" />
              {scanning ? "Abbrechen" : "Scan"}
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Kreatur zuweisen</Label>
          <Select value={creatureId} onValueChange={setCreatureId}>
            <SelectTrigger><SelectValue placeholder="Kreatur wählen..." /></SelectTrigger>
            <SelectContent>
              {creatures?.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name} ({c.type})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedCreature && (
        <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-4">
          <div className="bg-muted rounded-lg p-2 flex-shrink-0">
            {selectedCreature.sprite_idle_url && selectedCreature.sprite_idle_frames ? (
              <SpriteAnimator
                src={selectedCreature.sprite_idle_url}
                frameCount={selectedCreature.sprite_idle_frames}
                frameSize={selectedCreature.sprite_frame_size ?? 64}
                fps={selectedCreature.sprite_fps ?? 8}
                loop
                scale={2}
              />
            ) : (
              <div
                style={{ width: 128, height: 128 }}
                className="bg-secondary rounded text-xs text-muted-foreground flex items-center justify-center font-mono"
              >
                kein Sprite
              </div>
            )}
          </div>
          <div className="space-y-2">
            <div className="font-mono text-lg font-bold">{selectedCreature.name}</div>
            <div className="flex flex-wrap gap-2">
              <TypeBadge type={selectedCreature.type} />
              <RarityBadge rarity={selectedCreature.rarity} />
            </div>
            {selectedCreature.description && (
              <p className="text-xs text-muted-foreground max-w-md">{selectedCreature.description}</p>
            )}
          </div>
        </div>
      )}

      <Button
        onClick={() => registerMutation.mutate()}
        disabled={!uid.trim() || !creatureId || registerMutation.isPending}
        className="w-full"
      >
        {registerMutation.isPending ? "Wird registriert..." : "Karte registrieren"}
      </Button>


      <div className="space-y-2">
        <h3 className="font-mono text-lg font-bold">Registrierte Karten ({cards?.length || 0})</h3>
        {isLoading ? (
          <p className="text-muted-foreground text-sm">Laden...</p>
        ) : (
          <div className="space-y-2">
            {cards?.map((card) => {
              const instance = Array.isArray(card.card_instances) ? card.card_instances[0] : card.card_instances;
              const creature = card.creatures;
              return (
                <div key={card.id} className="bg-card border border-border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <code className="text-xs text-primary font-mono">{card.uid}</code>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => resetMutation.mutate(card.id)} title="Zurücksetzen">
                        <RotateCcw size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(card.id)} title="Löschen">
                        <Trash2 size={14} className="text-destructive" />
                      </Button>
                    </div>
                  </div>
                  {creature && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{creature.name}</span>
                      <TypeBadge type={creature.type} />
                      <RarityBadge rarity={creature.rarity} />
                    </div>
                  )}
                  {instance && (
                    <div className="text-xs text-muted-foreground font-mono">
                      SP: {instance.skill_points} · Kämpfe: {instance.battles_fought} · Training: {instance.training_sessions}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
