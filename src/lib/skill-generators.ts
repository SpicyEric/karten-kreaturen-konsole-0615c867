import { TYPE_LABELS, KIND_LABELS, TIER_LABELS } from "./constants";

// ── Skill Name Generator ──────────────────────────────────────────────
// Fantasy compound names by Typ + Art (Angriff / Verteidigung / Support)

const NAME_POOLS: Record<string, Record<string, string[]>> = {
  feuer: {
    attack: ["Feuerzunge", "Glutstoß", "Heißer Stich", "Feuersturm", "Flammenschlag", "Lavahieb", "Brandwelle", "Aschefaust", "Magmaspeer", "Sengender Biss"],
    defence: ["Flammenwall", "Glutpanzer", "Aschemantel", "Feuerschild", "Hitzewand", "Glutbarriere"],
    support: ["Glutsegen", "Flammentanz", "Wärmeaura", "Feueratem", "Phönixfeder", "Sengende Hoffnung"],
  },
  wasser: {
    attack: ["Flutwelle", "Wasserspeer", "Tiefenstoß", "Strudelhieb", "Sturzbach", "Druckwelle", "Tsunamischlag", "Tropfenpfeil"],
    defence: ["Wasserschild", "Flutwall", "Tiefennebel", "Spiegelteich", "Korallenpanzer"],
    support: ["Heilquelle", "Fluss der Erneuerung", "Kühle Welle", "Lebensbach", "Reine Strömung", "Quellsegen"],
  },
  stein: {
    attack: ["Felsbrocken", "Erdspalter", "Granitfaust", "Steinhagel", "Bergstoß", "Krustenhieb", "Splitterschlag"],
    defence: ["Steinwall", "Felsenschild", "Granitpanzer", "Bergrüstung", "Krustenschild", "Obsidianmauer"],
    support: ["Erdsegen", "Steinerne Ruhe", "Bergweisheit", "Wurzeltrost"],
  },
  luft: {
    attack: ["Sturmstoß", "Windklinge", "Zyklonschlag", "Böenhieb", "Sturmpfeil", "Luftspirale", "Tornadowurf"],
    defence: ["Windwall", "Luftschleier", "Sturmschild", "Wirbelmantel", "Brisenbarriere"],
    support: ["Aufwind", "Frische Brise", "Windsegen", "Höhenluft", "Sturmgeflüster"],
  },
  blitz: {
    attack: ["Blitzschlag", "Donnerstoß", "Funkenregen", "Voltklinge", "Schockhieb", "Gewittersturm", "Plasmastrahl"],
    defence: ["Blitzschild", "Funkenwand", "Voltbarriere", "Statikpanzer"],
    support: ["Energiestrom", "Funkensegen", "Schockwelle", "Voltwecker"],
  },
  eis: {
    attack: ["Eisstachel", "Frostbiss", "Eisspeer", "Schneesturm", "Frosthieb", "Kristallschlag", "Gletscherfaust"],
    defence: ["Eiswall", "Frostschild", "Kristallpanzer", "Gletschermauer", "Schneerüstung"],
    support: ["Frostatem", "Klare Kälte", "Eissegen", "Schneestille"],
  },
  gift: {
    attack: ["Giftbiss", "Säurestoß", "Toxinwelle", "Schlangenhieb", "Pestpfeil", "Faulender Stich"],
    defence: ["Giftwolke", "Säureschild", "Toxinmantel", "Mooresnebel"],
    support: ["Giftsegen", "Heilende Säure", "Sumpfruhe", "Faulender Trost"],
  },
  licht: {
    attack: ["Strahlhieb", "Lichtspeer", "Sonnenstoß", "Glanzklinge", "Blendlicht", "Aurastrahl"],
    defence: ["Lichtschild", "Strahlwand", "Aurabarriere", "Sonnenmantel"],
    support: ["Heilstrahl", "Sonnensegen", "Lichtgebet", "Strahlende Hoffnung", "Aura der Erneuerung"],
  },
  schatten: {
    attack: ["Schattenklinge", "Dunkelstoß", "Nachthieb", "Finsterspeer", "Schattenbiss", "Voidschlag"],
    defence: ["Schattenwall", "Dunkelmantel", "Nachtschleier", "Finsterschild"],
    support: ["Schattensegen", "Stille Nacht", "Dunkles Flüstern", "Finsterer Trost"],
  },
};

export function generateSkillName(type: string, kind: string): string {
  const typePool = NAME_POOLS[type] || NAME_POOLS.feuer;
  const arr = typePool[kind] || typePool.attack;
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Description Generator ────────────────────────────────────────────
export interface SkillDescInput {
  name: string;
  type: string;
  kind: string;
  tier: string;
  isAreaDamage: boolean;
  appliesStun: boolean;
  appliesWeakness: boolean;
  cooldownTurns: number;
  supportType: string | null;
  healValue: number | null;
}

export function generateSkillDescription(s: SkillDescInput): string {
  const typeLabel = TYPE_LABELS[s.type]?.replace(/\s.*$/, "") || s.type;
  const parts: string[] = [];

  if (s.kind === "attack") {
    const flavors = [
      `${s.name} schlägt mit der rohen Kraft des ${typeLabel}-Elements zu`,
      `${s.name} entfesselt die Wucht von ${typeLabel} gegen das Ziel`,
      `${s.name} trifft den Gegner mit der Macht des ${typeLabel}`,
    ];
    parts.push(flavors[Math.floor(Math.random() * flavors.length)]);
    const tags: string[] = [];
    if (s.appliesStun) tags.push("lähmt das Ziel für einen Zug");
    if (s.appliesWeakness) tags.push("schwächt den nächsten Gegenangriff");
    if (s.isAreaDamage) tags.push("trifft auch danebenstehende Feinde");
    if (tags.length) parts[0] += ` und ${tags.join(", ")}`;
    parts[0] += ".";
  } else if (s.kind === "defence") {
    parts.push(`${s.name} errichtet eine schützende ${typeLabel}-Barriere und blockt den nächsten Angriff – die Kreatur kann jedoch im nächsten Zug nicht handeln.`);
  } else if (s.kind === "support") {
    if (s.supportType === "single_heal") {
      parts.push(`${s.name} heilt eine verbündete Kreatur mit der Kraft des ${typeLabel}.`);
    } else if (s.supportType === "team_heal") {
      const v = s.healValue ?? 0;
      parts.push(`${s.name} heilt das gesamte Team um ${v} LP mit der Energie des ${typeLabel}.`);
    } else if (s.supportType === "shield") {
      parts.push(`${s.name} hüllt eine verbündete Kreatur in einen ${typeLabel}-Schild und halbiert den nächsten Schaden.`);
    } else {
      parts.push(`${s.name} unterstützt das Team mit der Kraft des ${typeLabel}.`);
    }
    if (s.isAreaDamage) parts[0] += " Restenergie verletzt nahestehende Gegner leicht.";
  }

  if (s.cooldownTurns > 0) {
    parts.push(`Kann ${s.cooldownTurns} Zug${s.cooldownTurns > 1 ? "e" : ""} lang nicht erneut eingesetzt werden.`);
  }

  return parts.join(" ");
}

// ── Damage formula (shared util for combat system later) ────────────
export const TYPE_PRIMARY_STAT_MAP: Record<string, "strength" | "speed" | "intelligence"> = {
  feuer: "strength", stein: "strength", schatten: "strength",
  blitz: "speed", luft: "speed", licht: "speed",
  wasser: "intelligence", eis: "intelligence", gift: "intelligence",
};

const TIER_BONUS: Record<string, number> = {
  standard: 0, selten: 1, super: 3, episch: 5,
};

const AREA_BY_TIER: Record<string, number> = {
  standard: 1, selten: 2, super: 3, episch: 5,
};

// Stärke > Intelligenz > Geschwindigkeit > Stärke
const STAT_BEATS: Record<string, string> = {
  strength: "intelligence",
  intelligence: "speed",
  speed: "strength",
};

export function calculateSkillDamage(
  attackerStats: { strength: number; speed: number; intelligence: number },
  attackerType: string,
  defenderType: string,
  tier: string,
): number {
  const aStat = TYPE_PRIMARY_STAT_MAP[attackerType] || "strength";
  const dStat = TYPE_PRIMARY_STAT_MAP[defenderType] || "strength";
  const base = attackerStats[aStat] + (TIER_BONUS[tier] ?? 0);
  const advantage = STAT_BEATS[aStat] === dStat ? 2 : 0;
  return base + advantage;
}

export function getAreaDamageForTier(tier: string): number {
  return AREA_BY_TIER[tier] ?? 1;
}

export function getTeamHealForTier(tier: string): number {
  return ({ standard: 2, selten: 3, super: 4, episch: 6 } as Record<string, number>)[tier] ?? 2;
}

export function describeKind(kind: string) { return KIND_LABELS[kind] || kind; }
export function describeTier(tier: string) { return TIER_LABELS[tier] || tier; }
