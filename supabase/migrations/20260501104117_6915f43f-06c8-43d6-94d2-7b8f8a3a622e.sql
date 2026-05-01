-- 1. Skill folders table
CREATE TABLE public.skill_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.skill_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public full access on skill_folders"
ON public.skill_folders FOR ALL
USING (true) WITH CHECK (true);

-- 2. Update skills table
ALTER TABLE public.skills
  ADD COLUMN folder_id UUID REFERENCES public.skill_folders(id) ON DELETE SET NULL,
  ADD COLUMN is_area_damage BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN area_damage_value INTEGER,
  ADD COLUMN applies_stun BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN applies_weakness BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN cooldown_turns INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN support_type TEXT,
  ADD COLUMN heal_value INTEGER;

-- Drop deprecated columns (stat_affected stays for backward compat? user said remove primary_stat — we never had it; remove stat_affected since we now derive from type)
-- Actually user said "Remove: primary_stat field, base_damage field." — neither exists currently, but stat_affected was the old primary stat. Keep it nullable for safety.
ALTER TABLE public.skills ALTER COLUMN stat_affected DROP NOT NULL;

-- 3. Validation trigger for skill rules
CREATE OR REPLACE FUNCTION public.validate_skill_rules()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.kind NOT IN ('attack','defence','support') THEN
    RAISE EXCEPTION 'skill kind must be attack, defence, or support';
  END IF;

  IF NEW.kind = 'defence' THEN
    IF NEW.is_area_damage OR NEW.applies_stun OR NEW.applies_weakness THEN
      RAISE EXCEPTION 'defence skills cannot have offensive effects';
    END IF;
  END IF;

  IF NEW.kind <> 'attack' THEN
    IF NEW.applies_stun OR NEW.applies_weakness THEN
      RAISE EXCEPTION 'stun and weakness only allowed on attack skills';
    END IF;
  END IF;

  IF NEW.cooldown_turns < 0 OR NEW.cooldown_turns > 3 THEN
    RAISE EXCEPTION 'cooldown_turns must be between 0 and 3';
  END IF;

  IF NEW.kind = 'support' AND NEW.support_type IS NOT NULL
     AND NEW.support_type NOT IN ('single_heal','team_heal','shield') THEN
    RAISE EXCEPTION 'invalid support_type';
  END IF;

  -- Auto-set area damage value based on tier when checked
  IF NEW.is_area_damage THEN
    NEW.area_damage_value := CASE NEW.tier
      WHEN 'standard' THEN 1
      WHEN 'selten'   THEN 2
      WHEN 'episch'   THEN 3 -- legacy mapping; super tier handled below
      ELSE 1
    END;
    -- skill_tier enum is: standard, selten, super, episch
    IF NEW.tier::text = 'super' THEN NEW.area_damage_value := 3; END IF;
    IF NEW.tier::text = 'episch' THEN NEW.area_damage_value := 5; END IF;
  ELSE
    NEW.area_damage_value := NULL;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_skill_kind_trigger ON public.skills;
DROP TRIGGER IF EXISTS validate_skill_rules_trigger ON public.skills;
CREATE TRIGGER validate_skill_rules_trigger
BEFORE INSERT OR UPDATE ON public.skills
FOR EACH ROW EXECUTE FUNCTION public.validate_skill_rules();