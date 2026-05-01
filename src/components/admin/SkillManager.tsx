import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CREATURE_TYPES, SKILL_TIERS, STAT_OPTIONS_NEW, SKILL_KINDS, TYPE_LABELS, TIER_LABELS, STAT_LABELS, KIND_LABELS, KIND_ICONS } from "@/lib/constants";
import TypeBadge from "./TypeBadge";
import { Trash2 } from "lucide-react";

export default function SkillManager() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tier, setTier] = useState("standard");
  const [type, setType] = useState("feuer");
  const [statAffected, setStatAffected] = useState("strength");
  const [kind, setKind] = useState("attack");

  const { data: skills, isLoading } = useQuery({
    queryKey: ["skills"],
    queryFn: async () => {
      const { data, error } = await supabase.from("skills").select("*").order("type").order("tier").order("name");
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("skills").insert({
        name, description: description || null, tier, type, stat_affected: statAffected, kind,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      toast.success("Skill erstellt!");
      setName(""); setDescription("");
    },
    onError: (e) => toast.error("Fehler: " + e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("skills").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      toast.success("Skill gelöscht!");
    },
    onError: (e) => toast.error("Fehler: " + e.message),
  });

  return (
    <div className="space-y-6">
      <h2 className="font-mono text-xl font-bold">Neuen Skill erstellen</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Skillname..." />
        </div>
        <div className="space-y-2">
          <Label>Beschreibung</Label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional..." />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>Art</Label>
          <Select value={kind} onValueChange={setKind}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {SKILL_KINDS.map((k) => <SelectItem key={k} value={k}>{KIND_LABELS[k]} {KIND_ICONS[k]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Stufe</Label>
          <Select value={tier} onValueChange={setTier}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {SKILL_TIERS.map((t) => <SelectItem key={t} value={t}>{TIER_LABELS[t]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Typ</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CREATURE_TYPES.map((t) => <SelectItem key={t} value={t}>{TYPE_LABELS[t]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Stat</Label>
          <Select value={statAffected} onValueChange={setStatAffected}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {STAT_OPTIONS_NEW.map((s) => <SelectItem key={s} value={s}>{STAT_LABELS[s]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={() => createMutation.mutate()} disabled={!name || createMutation.isPending} className="w-full">
        {createMutation.isPending ? "Wird erstellt..." : "Skill erstellen"}
      </Button>

      <div className="space-y-2">
        <h3 className="font-mono text-lg font-bold">Alle Skills ({skills?.length || 0})</h3>
        {isLoading ? (
          <p className="text-muted-foreground text-sm">Laden...</p>
        ) : (
          <div className="space-y-2">
            {skills?.map((skill) => (
              <div key={skill.id} className="flex items-center justify-between bg-card border border-border rounded-lg p-3">
                <div className="flex items-center gap-3 min-w-0">
                  <TypeBadge type={skill.type} />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">
                      {KIND_ICONS[(skill as any).kind] || ""} {skill.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {TIER_LABELS[skill.tier] || skill.tier} · {STAT_LABELS[skill.stat_affected] || skill.stat_affected}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(skill.id)}>
                  <Trash2 size={14} className="text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
