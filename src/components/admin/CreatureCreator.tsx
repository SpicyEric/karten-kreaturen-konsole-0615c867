import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  CREATURE_TYPES, CREATURE_RARITIES,
  TYPE_LABELS, RARITY_LABELS,
  TYPE_PRIMARY_STAT, STAT_LABELS,
  STAT_TOTAL, STAT_MIN, STAT_MAX, KIND_ICONS,
} from "@/lib/constants";
import { generateCreatureName, generateDescription, generateStats } from "@/lib/creature-generators";
import TypeBadge from "./TypeBadge";
import RarityBadge from "./RarityBadge";
import { Shuffle, Dices, CreditCard, Plus } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type CreatureType = Database["public"]["Enums"]["creature_type"];
type CreatureRarity = Database["public"]["Enums"]["creature_rarity"];

type StatKey = "strength" | "speed" | "intelligence";

interface CreatedCreature {
  id: string;
  name: string;
  type: string;
  rarity: string;
  base_strength: number;
  base_speed: number;
  base_intelligence: number;
  skills: { name: string; kind: string }[];
}

export default function CreatureCreator() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [type, setType] = useState<CreatureType>("feuer");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rarity, setRarity] = useState<CreatureRarity>("gewoehnlich");
  const [imageUrl, setImageUrl] = useState("");
  const [stats, setStats] = useState<Record<StatKey, number>>({ strength: 10, speed: 10, intelligence: 10 });
  const [createdCreature, setCreatedCreature] = useState<CreatedCreature | null>(null);

  const { data: skills } = useQuery({
    queryKey: ["skills"],
    queryFn: async () => {
      const { data, error } = await supabase.from("skills").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const primaryStat = (TYPE_PRIMARY_STAT[type] || "strength") as StatKey;
  const hp = stats.strength + stats.speed + stats.intelligence;
  const typeSkills = skills?.filter(s => s.type === type) || [];
  const typeAttackSkills = typeSkills.filter(s => s.kind === "attack");

  // Linked sliders: changing one redistributes from the others
  const setStat = (key: StatKey, newValue: number) => {
    const clamped = Math.max(STAT_MIN, Math.min(STAT_MAX, newValue));
    const others = (["strength", "speed", "intelligence"] as StatKey[]).filter(k => k !== key);
    const oldValue = stats[key];
    const diff = clamped - oldValue;
    if (diff === 0) return;

    const next = { ...stats, [key]: clamped };
    let remaining = -diff; // we need to add this to others combined

    // Distribute remaining among others, clamping
    const otherValues = { [others[0]]: stats[others[0]], [others[1]]: stats[others[1]] };
    
    // Try to distribute evenly first
    while (remaining !== 0) {
      const dir = remaining > 0 ? 1 : -1;
      const candidates = others.filter(k => 
        dir > 0 ? otherValues[k] < STAT_MAX : otherValues[k] > STAT_MIN
      );
      if (candidates.length === 0) break;
      const target = candidates[Math.floor(Math.random() * candidates.length)];
      otherValues[target] += dir;
      remaining -= dir;
    }

    next[others[0]] = otherValues[others[0]];
    next[others[1]] = otherValues[others[1]];

    // Verify total; if not 30 (due to clamping limits), revert this change
    const total = next.strength + next.speed + next.intelligence;
    if (total !== STAT_TOTAL) return;

    setStats(next);
  };

  const randomizeName = () => setName(generateCreatureName(type));
  const randomizeDescription = () => setDescription(generateDescription(type));
  const randomizeStats = () => setStats(generateStats(type));

  const randomizeAll = () => {
    randomizeName();
    randomizeDescription();
    randomizeStats();
  };

  // Reset stats validity when total drifts (initial state has 30)
  useEffect(() => {
    const total = stats.strength + stats.speed + stats.intelligence;
    if (total !== STAT_TOTAL) {
      setStats(generateStats(type));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data: creature, error } = await supabase.from("creatures").insert({
        name,
        description: description || null,
        type,
        rarity,
        form: "standard",
        base_strength: stats.strength,
        base_speed: stats.speed,
        base_intelligence: stats.intelligence,
        max_active_skills: 3,
        image_url: imageUrl || null,
      }).select().single();
      if (error) throw error;

      // Auto-assign 2 starting skills (min 1 attack)
      const assignedSkills: { id: string; name: string; kind: string }[] = [];
      if (typeAttackSkills.length > 0) {
        const attack = typeAttackSkills[Math.floor(Math.random() * typeAttackSkills.length)];
        assignedSkills.push({ id: attack.id, name: attack.name, kind: attack.kind });
        const remainingPool = typeSkills.filter(s => s.id !== attack.id);
        if (remainingPool.length > 0) {
          const second = remainingPool[Math.floor(Math.random() * remainingPool.length)];
          assignedSkills.push({ id: second.id, name: second.name, kind: second.kind });
        }
      }

      if (assignedSkills.length > 0) {
        const links = assignedSkills.map((s, i) => ({
          creature_id: creature.id,
          skill_id: s.id,
          unlock_order: i + 1,
        }));
        const { error: linkError } = await supabase.from("creature_skills").insert(links);
        if (linkError) throw linkError;
      }

      return {
        id: creature.id,
        name: creature.name,
        type: creature.type,
        rarity: creature.rarity,
        base_strength: creature.base_strength,
        base_speed: creature.base_speed,
        base_intelligence: creature.base_intelligence,
        skills: assignedSkills.map(s => ({ name: s.name, kind: s.kind })),
      } as CreatedCreature;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["creatures"] });
      toast.success("Kreatur erstellt!");
      setCreatedCreature(data);
    },
    onError: (e: any) => toast.error("Fehler: " + e.message),
  });

  const resetForm = () => {
    setCreatedCreature(null);
    setName("");
    setDescription("");
    setImageUrl("");
    setStats(generateStats(type));
  };

  // ── Success state ──
  if (createdCreature) {
    return (
      <div className="space-y-6">
        <div className="bg-card border border-primary/40 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2 text-primary font-mono text-sm">
            ✓ Kreatur erfolgreich erstellt
          </div>
          <h2 className="font-mono text-3xl font-bold">{createdCreature.name}</h2>
          <div className="flex flex-wrap gap-2">
            <TypeBadge type={createdCreature.type} />
            <RarityBadge rarity={createdCreature.rarity} />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: "STR", value: createdCreature.base_strength },
              { label: "SPD", value: createdCreature.base_speed },
              { label: "INT", value: createdCreature.base_intelligence },
            ].map(({ label, value }) => (
              <div key={label} className="bg-secondary rounded p-3">
                <div className="text-xs text-muted-foreground font-mono">{label}</div>
                <div className="text-2xl font-bold font-mono text-primary">{value}</div>
              </div>
            ))}
          </div>
          <div className="bg-muted rounded p-3 text-center">
            <div className="text-xs text-muted-foreground font-mono">LEBEN</div>
            <div className="text-2xl font-bold font-mono text-foreground">
              {createdCreature.base_strength + createdCreature.base_speed + createdCreature.base_intelligence}
            </div>
          </div>
          {createdCreature.skills.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-mono">Start-Skills:</p>
              <div className="flex flex-wrap gap-1">
                {createdCreature.skills.map((s, i) => (
                  <span key={i} className="text-xs bg-accent/20 text-accent-foreground px-2 py-0.5 rounded">
                    {KIND_ICONS[s.kind]} {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            onClick={() => navigate(`/admin/cards?creatureId=${createdCreature.id}`)}
            className="w-full gap-2"
          >
            <CreditCard size={16} />
            Diese Kreatur einer NFC-Karte zuweisen
          </Button>
          <Button onClick={resetForm} variant="secondary" className="w-full gap-2">
            <Plus size={16} />
            Neue Kreatur erstellen
          </Button>
        </div>
      </div>
    );
  }

  // ── Form ──
  const statList: { key: StatKey; label: string }[] = [
    { key: "strength", label: STAT_LABELS.strength },
    { key: "speed", label: STAT_LABELS.speed },
    { key: "intelligence", label: STAT_LABELS.intelligence },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-xl font-bold">Neue Kreatur erstellen</h2>
        <Button onClick={randomizeAll} variant="secondary" size="sm" className="gap-2">
          <Dices size={14} />
          Alles randomisieren
        </Button>
      </div>

      {/* 1. Typ */}
      <div className="space-y-2">
        <Label>Typ</Label>
        <Select value={type} onValueChange={(v) => setType(v as CreatureType)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {CREATURE_TYPES.map((t) => (
              <SelectItem key={t} value={t}>{TYPE_LABELS[t]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 2. Name */}
      <div className="space-y-2">
        <Label>Name</Label>
        <div className="flex gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Kreaturname..." />
          <Button type="button" variant="secondary" size="icon" onClick={randomizeName} title="Namen generieren">
            <Shuffle size={16} />
          </Button>
        </div>
      </div>

      {/* 3. Beschreibung */}
      <div className="space-y-2">
        <Label>Beschreibung</Label>
        <div className="flex gap-2">
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional..." />
          <Button type="button" variant="secondary" size="icon" onClick={randomizeDescription} title="Beschreibung generieren">
            <Shuffle size={16} />
          </Button>
        </div>
      </div>

      {/* 4. Seltenheit */}
      <div className="space-y-2">
        <Label>Seltenheit</Label>
        <Select value={rarity} onValueChange={(v) => setRarity(v as CreatureRarity)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {CREATURE_RARITIES.map((r) => (
              <SelectItem key={r} value={r}>{RARITY_LABELS[r]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 5. Bild URL */}
      <div className="space-y-2">
        <Label>Bild URL (optional)</Label>
        <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
      </div>

      {/* 6. Stats */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-sm text-muted-foreground">
            Stats <span className="text-xs">(Σ = {STAT_TOTAL}, Primär: <strong className="text-primary">{STAT_LABELS[primaryStat]}</strong>)</span>
          </h3>
          <Button onClick={randomizeStats} variant="ghost" size="sm" className="gap-2 text-xs">
            <Dices size={12} />
            Zufällige Stats
          </Button>
        </div>

        {statList.map(({ key, label }) => (
          <div key={key} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className={key === primaryStat ? "text-primary font-bold" : ""}>
                {label} {key === primaryStat && "⭐"}
              </span>
              <span className="font-mono text-primary">{stats[key]}</span>
            </div>
            <Slider
              value={[stats[key]]}
              onValueChange={([v]) => setStat(key, v)}
              min={STAT_MIN}
              max={STAT_MAX}
              step={1}
            />
          </div>
        ))}

        {/* Leben (HP) */}
        <div className="bg-muted rounded-lg p-3 flex items-center justify-between mt-4">
          <div>
            <div className="text-xs text-muted-foreground font-mono">LEBEN (HP)</div>
            <div className="text-xs text-muted-foreground">Stärke + Geschwindigkeit + Intelligenz</div>
          </div>
          <div className="text-3xl font-bold font-mono text-foreground">{hp}</div>
        </div>
      </div>

      {/* Skill assignment hint */}
      {typeAttackSkills.length === 0 && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-sm text-destructive">
          ⚠️ Es existiert noch kein Angriffs-Skill für Typ {TYPE_LABELS[type]}. Die Kreatur wird ohne Start-Skills erstellt.
        </div>
      )}
      {typeAttackSkills.length > 0 && (
        <div className="bg-secondary/40 rounded-lg p-3 text-xs text-muted-foreground font-mono">
          ℹ️ 2 Start-Skills werden automatisch aus dem {TYPE_LABELS[type]}-Pool zugewiesen (mind. 1 Angriff).
        </div>
      )}

      <Button
        onClick={() => createMutation.mutate()}
        disabled={!name || createMutation.isPending}
        className="w-full"
        size="lg"
      >
        {createMutation.isPending ? "Wird erstellt..." : "Kreatur erstellen"}
      </Button>
    </div>
  );
}
