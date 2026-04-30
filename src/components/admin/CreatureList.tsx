import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import TypeBadge from "./TypeBadge";
import RarityBadge from "./RarityBadge";
import { FORM_LABELS, STAT_LABELS } from "@/lib/constants";
import { Trash2 } from "lucide-react";

export default function CreatureList() {
  const queryClient = useQueryClient();

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
    },
    onError: (e) => toast.error("Fehler: " + e.message),
  });

  if (isLoading) return <p className="text-muted-foreground text-sm">Laden...</p>;

  return (
    <div className="space-y-4">
      <h2 className="font-mono text-xl font-bold">Alle Kreaturen ({creatures?.length || 0})</h2>

      {creatures?.map((c) => (
        <div key={c.id} className="bg-card border border-border rounded-lg p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-mono font-bold text-lg">{c.name}</h3>
              {c.description && <p className="text-sm text-muted-foreground">{c.description}</p>}
            </div>
            <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(c.id)}>
              <Trash2 size={16} className="text-destructive" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <TypeBadge type={c.type} />
            <RarityBadge rarity={c.rarity} />
            <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded">
              {FORM_LABELS[c.form]}
            </span>
            <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded">
              Max Skills: {c.max_active_skills}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { label: "STR", value: c.base_strength },
              { label: "SPD", value: c.base_speed },
              { label: "END", value: c.base_endurance },
              { label: "MAG", value: c.base_magic },
            ].map(({ label, value }) => (
              <div key={label} className="bg-secondary rounded p-2">
                <div className="text-xs text-muted-foreground font-mono">{label}</div>
                <div className="text-lg font-bold font-mono text-primary">{value}</div>
              </div>
            ))}
          </div>

          {c.creature_skills && c.creature_skills.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-mono">Zugewiesene Skills:</p>
              <div className="flex flex-wrap gap-1">
                {c.creature_skills.map((cs: any) => (
                  <span key={cs.id} className="text-xs bg-accent/20 text-accent-foreground px-2 py-0.5 rounded">
                    {cs.skills?.name || "?"}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {creatures?.length === 0 && (
        <p className="text-muted-foreground text-sm text-center py-8">
          Noch keine Kreaturen erstellt. Geh zum "Kreaturen"-Tab um welche zu erstellen.
        </p>
      )}
    </div>
  );
}
