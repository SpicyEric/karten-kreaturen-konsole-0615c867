import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import {
  CREATURE_TYPES, SKILL_TIERS, SKILL_KINDS, SUPPORT_TYPES,
  TYPE_LABELS, TIER_LABELS, KIND_LABELS, KIND_ICONS, SUPPORT_TYPE_LABELS,
} from "@/lib/constants";
import {
  generateSkillName, generateSkillDescription,
  getAreaDamageForTier, getTeamHealForTier, TYPE_PRIMARY_STAT_MAP,
} from "@/lib/skill-generators";
import TypeBadge from "./TypeBadge";
import { Trash2, Shuffle, Wand2, FolderPlus, ChevronDown, ChevronRight, Folder, Search, X, Move } from "lucide-react";

const STAT_LABEL: Record<string, string> = {
  strength: "Stärke", speed: "Geschwindigkeit", intelligence: "Intelligenz",
};

export default function SkillManager() {
  const queryClient = useQueryClient();

  // ── Form state ──
  const [type, setType] = useState("feuer");
  const [kind, setKind] = useState("attack");
  const [tier, setTier] = useState("standard");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isAreaDamage, setIsAreaDamage] = useState(false);
  const [appliesStun, setAppliesStun] = useState(false);
  const [appliesWeakness, setAppliesWeakness] = useState(false);
  const [cooldownTurns, setCooldownTurns] = useState(0);
  const [supportType, setSupportType] = useState<string>("single_heal");
  const [folderId, setFolderId] = useState<string>("none");

  // ── Filter / folder UI state ──
  const [search, setSearch] = useState("");
  const [filterTypes, setFilterTypes] = useState<string[]>([]);
  const [filterKind, setFilterKind] = useState<string>("all");
  const [filterTier, setFilterTier] = useState<string>("all");
  const [filterEffect, setFilterEffect] = useState<string>("all");
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
  const [newFolderName, setNewFolderName] = useState("");

  // ── Queries ──
  const { data: skills, isLoading } = useQuery({
    queryKey: ["skills"],
    queryFn: async () => {
      const { data, error } = await supabase.from("skills").select("*").order("type").order("tier").order("name");
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: folders } = useQuery({
    queryKey: ["skill_folders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("skill_folders" as any).select("*").order("name");
      if (error) throw error;
      return data as any[];
    },
  });

  // ── Mutations ──
  const createMutation = useMutation({
    mutationFn: async () => {
      // Compute auto values
      const areaDmg = isAreaDamage ? getAreaDamageForTier(tier) : null;
      const heal = kind === "support" && supportType === "team_heal" ? getTeamHealForTier(tier) : null;

      const payload: any = {
        name,
        description: description || null,
        type,
        kind,
        tier,
        is_area_damage: isAreaDamage,
        area_damage_value: areaDmg,
        applies_stun: kind === "attack" ? appliesStun : false,
        applies_weakness: kind === "attack" ? appliesWeakness : false,
        cooldown_turns: cooldownTurns,
        support_type: kind === "support" ? supportType : null,
        heal_value: heal,
        folder_id: folderId === "none" ? null : folderId,
        // legacy field still nullable in DB
        stat_affected: TYPE_PRIMARY_STAT_MAP[type] || "strength",
      };
      const { error } = await supabase.from("skills").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      toast.success("Skill erstellt!");
      setName(""); setDescription("");
      setIsAreaDamage(false); setAppliesStun(false); setAppliesWeakness(false);
      setCooldownTurns(0);
    },
    onError: (e: any) => toast.error("Fehler: " + e.message),
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
    onError: (e: any) => toast.error("Fehler: " + e.message),
  });

  const moveSkillMutation = useMutation({
    mutationFn: async ({ skillId, folderId }: { skillId: string; folderId: string | null }) => {
      const { error } = await supabase.from("skills").update({ folder_id: folderId } as any).eq("id", skillId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["skills"] }),
    onError: (e: any) => toast.error("Fehler: " + e.message),
  });

  const createFolderMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("skill_folders" as any).insert({ name: newFolderName } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skill_folders"] });
      setNewFolderName("");
      toast.success("Ordner erstellt!");
    },
    onError: (e: any) => toast.error("Fehler: " + e.message),
  });

  const deleteFolderMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("skill_folders" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skill_folders"] });
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      toast.success("Ordner gelöscht!");
    },
    onError: (e: any) => toast.error("Fehler: " + e.message),
  });

  // ── Helpers ──
  const handleRandomName = () => setName(generateSkillName(type, kind));
  const handleGenerateDesc = () => {
    if (!name) { toast.error("Bitte zuerst einen Namen eingeben."); return; }
    setDescription(generateSkillDescription({
      name, type, kind, tier,
      isAreaDamage, appliesStun, appliesWeakness, cooldownTurns,
      supportType: kind === "support" ? supportType : null,
      healValue: kind === "support" && supportType === "team_heal" ? getTeamHealForTier(tier) : null,
    }));
  };

  const toggleFilterType = (t: string) => {
    setFilterTypes((prev) => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  // ── Filtered skills ──
  const filtered = useMemo(() => {
    if (!skills) return [];
    return skills.filter((s: any) => {
      if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterTypes.length > 0 && !filterTypes.includes(s.type)) return false;
      if (filterKind !== "all" && s.kind !== filterKind) return false;
      if (filterTier !== "all" && s.tier !== filterTier) return false;
      if (filterEffect !== "all") {
        if (filterEffect === "area" && !s.is_area_damage) return false;
        if (filterEffect === "stun" && !s.applies_stun) return false;
        if (filterEffect === "weakness" && !s.applies_weakness) return false;
        if (filterEffect === "cooldown" && (s.cooldown_turns ?? 0) === 0) return false;
      }
      return true;
    });
  }, [skills, search, filterTypes, filterKind, filterTier, filterEffect]);

  // group by folder
  const grouped = useMemo(() => {
    const map: Record<string, any[]> = { __unsorted: [] };
    (folders || []).forEach((f: any) => { map[f.id] = []; });
    filtered.forEach((s: any) => {
      const key = s.folder_id && map[s.folder_id] ? s.folder_id : "__unsorted";
      map[key].push(s);
    });
    return map;
  }, [filtered, folders]);

  const isFormValid = !!name && !createMutation.isPending;

  // ── Render ──
  return (
    <div className="space-y-8">
      {/* ===== CREATE FORM ===== */}
      <div className="space-y-5 bg-card border border-border rounded-lg p-5">
        <h2 className="font-mono text-xl font-bold">Neuen Skill erstellen</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Typ</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CREATURE_TYPES.map((t) => <SelectItem key={t} value={t}>{TYPE_LABELS[t]}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground font-mono">
              Schaden-Stat: {STAT_LABEL[TYPE_PRIMARY_STAT_MAP[type]]}
            </p>
          </div>
          <div className="space-y-2">
            <Label>Art</Label>
            <Select value={kind} onValueChange={setKind}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SKILL_KINDS.map((k) => <SelectItem key={k} value={k}>{KIND_ICONS[k]} {KIND_LABELS[k]}</SelectItem>)}
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
        </div>

        <div className="space-y-2">
          <Label>Name</Label>
          <div className="flex gap-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Skillname..." />
            <Button type="button" variant="secondary" size="icon" onClick={handleRandomName} title="Namen generieren">
              <Shuffle size={16} />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Beschreibung</Label>
            <Button type="button" variant="secondary" size="sm" className="gap-2" onClick={handleGenerateDesc}>
              <Wand2 size={14} /> Beschreibung generieren
            </Button>
          </div>
          <Textarea
            value={description}
            readOnly
            placeholder="Wird automatisch generiert..."
            className="bg-muted/40 cursor-not-allowed min-h-[80px]"
          />
        </div>

        {/* Effects */}
        <div className="space-y-3 border-t border-border pt-4">
          <h3 className="font-mono text-sm text-muted-foreground">Effekte</h3>

          {/* Flächenschaden – nicht für Verteidigung */}
          {kind !== "defence" && (
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox checked={isAreaDamage} onCheckedChange={(v) => setIsAreaDamage(!!v)} />
              <span className="text-sm">
                Flächenschaden{" "}
                <span className="text-xs text-muted-foreground">
                  (auto: {getAreaDamageForTier(tier)} Schaden bei {TIER_LABELS[tier]})
                </span>
              </span>
            </label>
          )}

          {kind === "attack" && (
            <>
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox checked={appliesStun} onCheckedChange={(v) => setAppliesStun(!!v)} />
                <span className="text-sm">Betäubung <span className="text-xs text-muted-foreground">(Ziel kann nächste Runde nicht handeln)</span></span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox checked={appliesWeakness} onCheckedChange={(v) => setAppliesWeakness(!!v)} />
                <span className="text-sm">Schwäche <span className="text-xs text-muted-foreground">(nächster Angriff des Ziels = halber Schaden)</span></span>
              </label>
            </>
          )}

          {kind === "defence" && (
            <p className="text-xs text-muted-foreground bg-muted/40 rounded p-2">
              🛡️ Verteidigungs-Skills blocken den nächsten Angriff. Die Kreatur kann in der nächsten Runde nicht handeln. Kein Schaden, keine offensiven Effekte.
            </p>
          )}

          {kind === "support" && (
            <div className="space-y-2">
              <Label>Support-Typ</Label>
              <Select value={supportType} onValueChange={setSupportType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SUPPORT_TYPES.map((s) => <SelectItem key={s} value={s}>{SUPPORT_TYPE_LABELS[s]}</SelectItem>)}
                </SelectContent>
              </Select>
              {supportType === "team_heal" && (
                <p className="text-[11px] text-muted-foreground">Heilt Team um {getTeamHealForTier(tier)} LP (auto bei {TIER_LABELS[tier]})</p>
              )}
              {supportType === "single_heal" && (
                <p className="text-[11px] text-muted-foreground">Heilt ein Ziel um ~50% des Primärstats</p>
              )}
              {supportType === "shield" && (
                <p className="text-[11px] text-muted-foreground">Halbiert nächsten eingehenden Schaden eines Verbündeten</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>Cooldown (0–3 Runden)</Label>
            <Input
              type="number" min={0} max={3}
              value={cooldownTurns}
              onChange={(e) => setCooldownTurns(Math.max(0, Math.min(3, Number(e.target.value) || 0)))}
              className="w-24"
            />
          </div>
        </div>

        <div className="space-y-2 border-t border-border pt-4">
          <Label>Ordner (optional)</Label>
          <Select value={folderId} onValueChange={setFolderId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">— Unsortiert —</SelectItem>
              {(folders || []).map((f: any) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => createMutation.mutate()} disabled={!isFormValid} className="w-full" size="lg">
          {createMutation.isPending ? "Wird erstellt..." : "Skill erstellen"}
        </Button>
      </div>

      {/* ===== FOLDERS + FILTERS + LIST ===== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-lg font-bold">Skills ({skills?.length || 0})</h3>
        </div>

        {/* Folder create */}
        <div className="flex gap-2">
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Neuer Ordner..."
            className="max-w-xs"
          />
          <Button
            variant="secondary"
            size="sm"
            disabled={!newFolderName}
            onClick={() => createFolderMutation.mutate()}
            className="gap-2"
          >
            <FolderPlus size={14} /> Ordner erstellen
          </Button>
        </div>

        {/* Filter bar */}
        <div className="bg-muted/30 border border-border rounded-lg p-3 space-y-3">
          <div className="flex items-center gap-2">
            <Search size={14} className="text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Suche nach Name..."
              className="h-8"
            />
            {(search || filterTypes.length > 0 || filterKind !== "all" || filterTier !== "all" || filterEffect !== "all") && (
              <Button variant="ghost" size="sm" onClick={() => {
                setSearch(""); setFilterTypes([]); setFilterKind("all"); setFilterTier("all"); setFilterEffect("all");
              }} className="gap-1 h-8">
                <X size={12} /> Reset
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <Select value={filterKind} onValueChange={setFilterKind}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Arten</SelectItem>
                {SKILL_KINDS.map(k => <SelectItem key={k} value={k}>{KIND_ICONS[k]} {KIND_LABELS[k]}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterTier} onValueChange={setFilterTier}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Stufen</SelectItem>
                {SKILL_TIERS.map(t => <SelectItem key={t} value={t}>{TIER_LABELS[t]}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterEffect} onValueChange={setFilterEffect}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Effekte</SelectItem>
                <SelectItem value="area">Flächenschaden</SelectItem>
                <SelectItem value="stun">Betäubung</SelectItem>
                <SelectItem value="weakness">Schwäche</SelectItem>
                <SelectItem value="cooldown">Cooldown {">"} 0</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-1">
            {CREATURE_TYPES.map(t => (
              <button
                key={t}
                onClick={() => toggleFilterType(t)}
                className={`text-xs px-2 py-1 rounded border transition ${
                  filterTypes.includes(t)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border hover:bg-muted"
                }`}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Grouped list */}
        {isLoading ? (
          <p className="text-muted-foreground text-sm">Laden...</p>
        ) : (
          <div className="space-y-2">
            {(folders || []).map((f: any) => (
              <FolderBlock
                key={f.id}
                folder={f}
                skills={grouped[f.id] || []}
                folders={folders || []}
                isOpen={openFolders[f.id] !== false}
                onToggle={() => setOpenFolders((p) => ({ ...p, [f.id]: !(p[f.id] !== false) }))}
                onDelete={() => deleteFolderMutation.mutate(f.id)}
                onMove={(skillId, target) => moveSkillMutation.mutate({ skillId, folderId: target })}
                onDeleteSkill={(id) => deleteMutation.mutate(id)}
              />
            ))}
            <FolderBlock
              folder={{ id: "__unsorted", name: "Unsortiert" }}
              skills={grouped["__unsorted"] || []}
              folders={folders || []}
              isOpen={openFolders["__unsorted"] !== false}
              onToggle={() => setOpenFolders((p) => ({ ...p, __unsorted: !(p.__unsorted !== false) }))}
              onMove={(skillId, target) => moveSkillMutation.mutate({ skillId, folderId: target })}
              onDeleteSkill={(id) => deleteMutation.mutate(id)}
              isUnsorted
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Folder block component ──
function FolderBlock({
  folder, skills, folders, isOpen, onToggle, onDelete, onMove, onDeleteSkill, isUnsorted,
}: {
  folder: { id: string; name: string };
  skills: any[];
  folders: any[];
  isOpen: boolean;
  onToggle: () => void;
  onDelete?: () => void;
  onMove: (skillId: string, target: string | null) => void;
  onDeleteSkill: (id: string) => void;
  isUnsorted?: boolean;
}) {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <div className="border border-border rounded-lg bg-card">
        <div className="flex items-center justify-between p-3">
          <CollapsibleTrigger className="flex items-center gap-2 flex-1 text-left">
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <Folder size={14} className="text-primary" />
            <span className="font-mono text-sm font-bold">{folder.name}</span>
            <span className="text-xs text-muted-foreground">({skills.length})</span>
          </CollapsibleTrigger>
          {!isUnsorted && onDelete && (
            <Button variant="ghost" size="icon" onClick={onDelete} title="Ordner löschen">
              <Trash2 size={12} className="text-destructive" />
            </Button>
          )}
        </div>
        <CollapsibleContent>
          <div className="border-t border-border p-2 space-y-1">
            {skills.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-3">Keine Skills</p>
            ) : skills.map((s) => (
              <SkillRow
                key={s.id}
                skill={s}
                folders={folders}
                onMove={onMove}
                onDelete={() => onDeleteSkill(s.id)}
              />
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

function SkillRow({ skill, folders, onMove, onDelete }: {
  skill: any; folders: any[];
  onMove: (skillId: string, target: string | null) => void;
  onDelete: () => void;
}) {
  const effectBadges: string[] = [];
  if (skill.is_area_damage) effectBadges.push(`💥 Fläche +${skill.area_damage_value}`);
  if (skill.applies_stun) effectBadges.push("💫 Betäubung");
  if (skill.applies_weakness) effectBadges.push("🩸 Schwäche");
  if (skill.cooldown_turns > 0) effectBadges.push(`⏳ CD ${skill.cooldown_turns}`);
  if (skill.support_type) effectBadges.push(SUPPORT_TYPE_LABELS[skill.support_type] || skill.support_type);

  return (
    <div className="flex items-center justify-between gap-2 p-2 rounded hover:bg-muted/40">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <TypeBadge type={skill.type} />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm truncate">
            {KIND_ICONS[skill.kind]} {skill.name}{" "}
            <span className="text-[10px] text-muted-foreground">{TIER_LABELS[skill.tier]}</span>
          </p>
          {effectBadges.length > 0 && (
            <p className="text-[10px] text-muted-foreground">{effectBadges.join(" · ")}</p>
          )}
        </div>
      </div>
      <Select
        value={skill.folder_id || "none"}
        onValueChange={(v) => onMove(skill.id, v === "none" ? null : v)}
      >
        <SelectTrigger className="h-7 w-32 text-xs">
          <Move size={10} className="mr-1" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Unsortiert</SelectItem>
          {folders.map((f: any) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
        </SelectContent>
      </Select>
      <Button variant="ghost" size="icon" onClick={onDelete}>
        <Trash2 size={14} className="text-destructive" />
      </Button>
    </div>
  );
}
