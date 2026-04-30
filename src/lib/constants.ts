export const CREATURE_TYPES = [
  'feuer', 'wasser', 'erde', 'luft', 'blitz', 'eis', 'gift', 'licht', 'schatten'
] as const;

export const CREATURE_RARITIES = [
  'gewoehnlich', 'selten', 'episch', 'legendaer'
] as const;

export const CREATURE_FORMS = ['standard', 'spezial'] as const;

export const SKILL_TIERS = ['standard', 'selten', 'super', 'episch'] as const;

export const STAT_OPTIONS = ['strength', 'speed', 'endurance', 'magic'] as const;

export const TYPE_LABELS: Record<string, string> = {
  feuer: 'Feuer 🔥', wasser: 'Wasser 💧', erde: 'Erde 🌍', luft: 'Luft 💨',
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
  strength: 'Stärke', speed: 'Geschwindigkeit', endurance: 'Ausdauer', magic: 'Magie'
};
