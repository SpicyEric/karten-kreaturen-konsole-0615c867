export const CREATURE_TYPES = [
  'feuer', 'wasser', 'stein', 'luft', 'blitz', 'eis', 'gift', 'licht', 'schatten'
] as const;

export const CREATURE_RARITIES = [
  'gewoehnlich', 'selten', 'episch', 'legendaer'
] as const;

export const CREATURE_FORMS = ['standard', 'spezial'] as const;

export const SKILL_TIERS = ['standard', 'selten', 'super', 'episch'] as const;

export const STAT_OPTIONS = ['strength', 'speed', 'intelligence'] as const;

export const SKILL_KINDS = ['attack', 'defence', 'support'] as const;

export const TYPE_LABELS: Record<string, string> = {
  feuer: 'Feuer 🔥', wasser: 'Wasser 💧', stein: 'Stein 🪨', luft: 'Luft 💨',
  blitz: 'Blitz ⚡', eis: 'Eis ❄️', gift: 'Gift ☠️', licht: 'Licht ✨', schatten: 'Schatten 🌑'
};

export const RARITY_LABELS: Record<string, string> = {
  gewoehnlich: 'Gewöhnlich', selten: 'Selten', episch: 'Episch', legendaer: 'Legendär'
};

export const FORM_LABELS: Record<string, string> = {
  standard: 'Standard', spezial: 'Spezial'
};

export const TIER_LABELS: Record<string, string> = {
  standard: 'Standard', selten: 'Selten', super: 'Super', episch: 'Episch'
};

export const STAT_OPTIONS_NEW = ['strength', 'speed', 'intelligence'] as const;

export const STAT_LABELS: Record<string, string> = {
  strength: 'Stärke', speed: 'Geschwindigkeit', intelligence: 'Intelligenz',
  // backward-compat alias
  magic: 'Intelligenz',
};

export const KIND_LABELS: Record<string, string> = {
  attack: 'Angriff', defence: 'Verteidigung', support: 'Support'
};

export const KIND_ICONS: Record<string, string> = {
  attack: '⚔️', defence: '🛡️', support: '✨'
};

// Stat-to-Type mapping: which stat is primary for which types
export const STAT_TYPE_MAPPING: Record<string, string[]> = {
  strength: ['feuer', 'stein', 'schatten'],
  speed: ['blitz', 'luft', 'licht'],
  intelligence: ['wasser', 'eis', 'gift'],
};

// Reverse mapping: type to primary stat
export const TYPE_PRIMARY_STAT: Record<string, string> = {
  feuer: 'strength', stein: 'strength', schatten: 'strength',
  blitz: 'speed', luft: 'speed', licht: 'speed',
  wasser: 'intelligence', eis: 'intelligence', gift: 'intelligence',
};

export const STAT_MIN = 3;
export const STAT_MAX = 20;

// Rarity-based starting stat point ranges (sum of 3 base stats)
export const RARITY_STAT_RANGE: Record<string, { min: number; max: number }> = {
  gewoehnlich: { min: 15, max: 20 },
  selten:      { min: 20, max: 25 },
  episch:      { min: 25, max: 30 },
  legendaer:   { min: 30, max: 35 },
};

// Rarity-based max additional skill points (gained through training)
export const RARITY_MAX_SKILL_POINTS: Record<string, number> = {
  gewoehnlich: 15,
  selten:      20,
  episch:      25,
  legendaer:   30,
};
