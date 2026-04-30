export const CREATURE_TYPES = [
  'feuer', 'wasser', 'stein', 'luft', 'blitz', 'eis', 'gift', 'licht', 'schatten'
] as const;

export const CREATURE_RARITIES = [
  'gewoehnlich', 'selten', 'episch', 'legendaer'
] as const;

export const CREATURE_FORMS = ['standard', 'spezial'] as const;

export const SKILL_TIERS = ['standard', 'selten', 'super', 'episch'] as const;

export const STAT_OPTIONS = ['strength', 'speed', 'magic'] as const;

export const SKILL_KINDS = ['attack', 'defence'] as const;

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

export const STAT_LABELS: Record<string, string> = {
  strength: 'Stärke', speed: 'Geschwindigkeit', magic: 'Magie'
};

export const KIND_LABELS: Record<string, string> = {
  attack: 'Angriff', defence: 'Verteidigung'
};

// Stat-to-Type mapping: which stat is primary for which types
export const STAT_TYPE_MAPPING: Record<string, string[]> = {
  strength: ['feuer', 'stein', 'schatten'],
  speed: ['blitz', 'luft', 'licht'],
  magic: ['wasser', 'eis', 'gift'],
};

// Reverse mapping: type to primary stat
export const TYPE_PRIMARY_STAT: Record<string, string> = {
  feuer: 'strength', stein: 'strength', schatten: 'strength',
  blitz: 'speed', luft: 'speed', licht: 'speed',
  wasser: 'magic', eis: 'magic', gift: 'magic',
};
