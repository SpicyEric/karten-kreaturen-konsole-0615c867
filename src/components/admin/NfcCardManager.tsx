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
import { RotateCcw, Trash2 } from "lucide-react";

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

  const registerMutation = useMutation({
    mutationFn: async () => {
      const { data: card, error: cardError } = await supabase
        .from("nfc_cards")
        .insert({ uid: uid.trim().toUpperCase(), creature_id: creatureId })
        .select()
        .single();
      if (cardError) throw cardError;

      const { error: instanceError } = await supabase
        .from("card_instances")
        .insert({ nfc_card_id: card.id, creature_id: creatureId });
      if (instanceError) throw instanceError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nfc-cards"] });
      toast.success("NFC Karte registriert!");
      setUid(""); setCreatureId("");
    },
    onError: (e) => toast.error("Fehler: " + e.message),
  });

  const resetMutation = useMutation({
    mutationFn: async (cardId: string) => {
      const card = cards?.find((c) => c.id === cardId);
      if (!card) return;
      await supabase.from("card_instances").delete().eq("nfc_card_id", cardId);
      await supabase.from("card_instances").insert({
        nfc_card_id: cardId, creature_id: card.creature_id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nfc-cards"] });
      toast.success("Karten-Instanz zurückgesetzt!");
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

  return (
    <div className="space-y-6">
      <h2 className="font-mono text-xl font-bold">NFC Karte registrieren</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>NFC UID</Label>
          <Input
            value={uid}
            onChange={(e) => setUid(e.target.value)}
            placeholder="z.B. 04:A3:B2:C1:D4:E5:F6"
            className="font-mono"
          />
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
