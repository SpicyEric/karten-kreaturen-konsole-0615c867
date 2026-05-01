import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import TypeBadge from "./TypeBadge";
import RarityBadge from "./RarityBadge";
import CreatureSpritePreview from "@/components/CreatureSpritePreview";
import { KIND_ICONS, RARITY_MAX_SKILL_POINTS } from "@/lib/constants";
import { Trash2, CreditCard } from "lucide-react";

export default function CreatureList() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: creatures, isLoading } = useQuery({
    queryKey: ["creatures"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("creatures")
        .select("*, creature_skills(*, skills(*))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("creatures").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creatures"] });
      toast.success("Kreatur gelöscht!");
      setSelectedId(null);
    },
    onError: (e) => toast.error("Fehler: " + e.message),
  });

  if (isLoading) return <p className="text-muted-foreground text-sm">Laden...</p>;

  const selected = creatures?.find(c => c.id === selectedId);

  return (
    <div className="space-y-4">
      <h2 className="font-mono text-xl font-bold">Alle Kreaturen ({creatures?.length || 0})</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {creatures?.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedId(c.id)}
            className="bg-card border border-border rounded-lg p-4 text-left hover:border-primary/40 transition-colors space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-mono font-bold text-lg truncate">{c.name}</h3>
            </div>
            <div className="flex flex-wrap gap-1">
              <TypeBadge type={c.type} />
              <RarityBadge rarity={c.rarity} />
            </div>
            <div className="grid grid-cols-3 gap-1 text-center pt-1">
              {[
                { label: "STR", value: c.base_strength },
                { label: "SPD", value: c.base_speed },
                { label: "INT", value: c.base_intelligence },
              ].map(({ label, value }) => (
                <div key={label} className="bg-secondary rounded px-2 py-1">
                  <div className="text-[10px] text-muted-foreground font-mono">{label}</div>
                  <div className="text-sm font-bold font-mono text-primary">{value}</div>
                </div>
              ))}
            </div>
            <div className="text-[10px] font-mono text-muted-foreground text-center pt-1">
              LEBEN {c.base_strength + c.base_speed + c.base_intelligence}
              {" / "}
              <span className="text-primary">{c.base_strength + c.base_speed + c.base_intelligence + (c.max_skill_points ?? RARITY_MAX_SKILL_POINTS[c.rarity] ?? 0)}</span>
            </div>
          </button>
        ))}
      </div>

      {creatures?.length === 0 && (
        <p className="text-muted-foreground text-sm text-center py-8">
          Noch keine Kreaturen erstellt. Geh zum "Kreaturen"-Tab um welche zu erstellen.
        </p>
      )}

      <Dialog open={!!selectedId} onOpenChange={(o) => !o && setSelectedId(null)}>
        <DialogContent className="max-w-md">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-mono text-2xl">{selected.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {selected.description && (
                  <p className="text-sm text-muted-foreground">{selected.description}</p>
                )}
                <CreatureSpritePreview creature={selected as any} scale={2} />
                <div className="flex flex-wrap gap-2">
                  <TypeBadge type={selected.type} />
                  <RarityBadge rarity={selected.rarity} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: "STR", value: selected.base_strength },
                    { label: "SPD", value: selected.base_speed },
                    { label: "INT", value: selected.base_intelligence },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-secondary rounded p-2">
                      <div className="text-xs text-muted-foreground font-mono">{label}</div>
                      <div className="text-lg font-bold font-mono text-primary">{value}</div>
                    </div>
                  ))}
                </div>
                {(() => {
                  const baseTotal = selected.base_strength + selected.base_speed + selected.base_intelligence;
                  const maxSp = selected.max_skill_points ?? RARITY_MAX_SKILL_POINTS[selected.rarity] ?? 0;
                  return (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-muted rounded p-2 text-center">
                        <div className="text-xs text-muted-foreground font-mono">LEBEN AKTUELL</div>
                        <div className="text-xl font-bold font-mono text-foreground">{baseTotal}</div>
                      </div>
                      <div className="bg-muted rounded p-2 text-center">
                        <div className="text-xs text-muted-foreground font-mono">LEBEN MAX</div>
                        <div className="text-xl font-bold font-mono text-primary">{baseTotal + maxSp}</div>
                        <div className="text-[10px] text-muted-foreground">+{maxSp} via Training</div>
                      </div>
                    </div>
                  );
                })()}
                {selected.creature_skills && selected.creature_skills.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-mono">Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {selected.creature_skills.map((cs: any) => (
                        <span key={cs.id} className="text-xs bg-accent/20 text-accent-foreground px-2 py-0.5 rounded">
                          {KIND_ICONS[cs.skills?.kind] || ""} {cs.skills?.name || "?"}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button
                    onClick={() => navigate(`/admin/cards?creatureId=${selected.id}`)}
                    className="gap-2"
                  >
                    <CreditCard size={14} />
                    NFC zuweisen
                  </Button>
                  <Button
                    onClick={() => deleteMutation.mutate(selected.id)}
                    variant="destructive"
                    className="gap-2"
                  >
                    <Trash2 size={14} />
                    Löschen
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

