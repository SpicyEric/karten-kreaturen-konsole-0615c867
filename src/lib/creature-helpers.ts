import { RARITY_MAX_SKILL_POINTS } from "./constants";

export interface LoadedCreature {
  cardUid: string;
  cardId: string;
  instanceId: string;
  creatureId: string;
  name: string;
  description: string | null;
  type: string;
  rarity: string;
  form: string;
  base_strength: number;
  base_speed: number;
  base_intelligence: number;
  max_skill_points: number;
  current_skill_points: number;
  skill_points: number;
  battles_fought: number;
  training_sessions: number;
  sprite_idle_url: string | null;
  sprite_idle_frames: number | null;
  sprite_attack_url: string | null;
  sprite_attack_frames: number | null;
  sprite_hit_url: string | null;
  sprite_hit_frames: number | null;
  sprite_die_url: string | null;
  sprite_die_frames: number | null;
  sprite_frame_size: number;
  sprite_fps: number;
  unlocked_skills: Array<{
    id: string;
    name: string;
    type: string;
    kind: string;
    tier: string;
    cooldown_turns: number;
  }>;
}

export function calcHp(c: Pick<LoadedCreature, "base_strength" | "base_speed" | "base_intelligence" | "current_skill_points" | "max_skill_points" | "rarity">) {
  const baseTotal = c.base_strength + c.base_speed + c.base_intelligence;
  const maxSp = c.max_skill_points ?? RARITY_MAX_SKILL_POINTS[c.rarity] ?? 0;
  const currentSp = c.current_skill_points ?? 0;
  return {
    current: baseTotal + currentSp,
    max: baseTotal + maxSp,
    currentSp,
    maxSp,
  };
}
