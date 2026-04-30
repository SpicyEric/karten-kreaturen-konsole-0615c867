import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CREATURE_TYPES, CREATURE_RARITIES, CREATURE_FORMS, TYPE_LABELS, RARITY_LABELS, FORM_LABELS } from "@/lib/constants";
import type { Database } from "@/integrations/supabase/types";

type CreatureInsert = Database["public"]["Tables"]["creatures"]["Insert"];
type CreatureType = Database["public"]["Enums"]["creature_type"];
type CreatureRarity = Database["public"]["Enums"]["creature_rarity"];
type CreatureForm = Database["public"]["Enums"]["creature_form"];

export default function CreatureCreator() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<CreatureType>("feuer");
  const [rarity, setRarity] = useState<CreatureRarity>("gewoehnlich");
  const [form, setForm] = useState<CreatureForm>("standard");
  const [strength, setStrength] = useState(10);
  const [speed, setSpeed] = useState(10);
  const [endurance, setEndurance] = useState(10);
  const [magic, setMagic] = useState(10);
  const [maxActiveSkills, setMaxActiveSkills] = useState(3);
  const [imageUrl, setImageUrl] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const { data: skills } = useQuery({
    queryKey: ["skills"],
    queryFn: async () => {
      const { data, error } = await supabase.from("skills").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const filteredSkills = skills?.filter((s) => s.type === type) || [];

  const createMutation = useMutation({
    mutationFn: async () => {
      const creature: CreatureInsert = {
        name, description: description || null, type, rarity, form,
        base_strength: strength, base_speed: speed, base_endurance: endurance,
        base_magic: magic, max_active_skills: maxActiveSkills,
        image_url: imageUrl || null,
      };
      const { data, error } = await supabase.from("creatures").insert(creature).select().single();
      if (error) throw error;

      if (selectedSkills.length > 0) {
        const links = selectedSkills.map((skillId, i) => ({
          creature_id: data.id, skill_id: skillId, unlock_order: i + 1,
        }));
        const { error: linkError } = await supabase.from("creature_skills").insert(links);
        if (linkError) throw linkError;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creatures"] });
      toast.success("Kreatur erstellt!");
      setName(""); setDescription(""); setSelectedSkills([]);
      setStrength(10); setSpeed(10); setEndurance(10); setMagic(10);
    },
    onError: (e) => toast.error("Fehler: " + e.message),
  });

  const toggleSkill = (id: string) => {
    setSelectedSkills((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="font-mono text-xl font-bold">Neue Kreatur erstellen</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Kreaturname..." />
        </div>
        <div className="space-y-2">
          <Label>Beschreibung</Label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional..." />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Typ</Label>
          <Select value={type} onValueChange={(v) => { setType(v as CreatureType); setSelectedSkills([]); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CREATURE_TYPES.map((t) => <SelectItem key={t} value={t}>{TYPE_LABELS[t]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Seltenheit</Label>
          <Select value={rarity} onValueChange={(v) => setRarity(v as CreatureRarity)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CREATURE_RARITIES.map((r) => <SelectItem key={r} value={r}>{RARITY_LABELS[r]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Form</Label>
          <Select value={form} onValueChange={(v) => setForm(v as CreatureForm)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CREATURE_FORMS.map((f) => <SelectItem key={f} value={f}>{FORM_LABELS[f]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-mono text-sm text-muted-foreground">Basiswerte</h3>
        {[
          { label: "Stärke", value: strength, set: setStrength },
          { label: "Geschwindigkeit", value: speed, set: setSpeed },
          { label: "Ausdauer", value: endurance, set: setEndurance },
          { label: "Magie", value: magic, set: setMagic },
        ].map(({ label, value, set }) => (
          <div key={label} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{label}</span>
              <span className="font-mono text-primary">{value}</span>
            </div>
            <Slider value={[value]} onValueChange={([v]) => set(v)} min={1} max={100} step={1} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Max. aktive Skills</Label>
          <Select value={String(maxActiveSkills)} onValueChange={(v) => setMaxActiveSkills(Number(v))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 (Standard)</SelectItem>
              <SelectItem value="4">4 (Spezial)</SelectItem>
              <SelectItem value="5">5 (Spezial+)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Bild-URL</Label>
          <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
        </div>
      </div>

      {filteredSkills.length > 0 && (
        <div className="space-y-2">
          <Label>Skills zuweisen ({type})</Label>
          <div className="flex flex-wrap gap-2">
            {filteredSkills.map((skill) => (
              <button
                key={skill.id}
                type="button"
                onClick={() => toggleSkill(skill.id)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  selectedSkills.includes(skill.id)
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {skill.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <Button
        onClick={() => createMutation.mutate()}
        disabled={!name || createMutation.isPending}
        className="w-full"
      >
        {createMutation.isPending ? "Wird erstellt..." : "Kreatur erstellen"}
      </Button>
    </div>
  );
}
