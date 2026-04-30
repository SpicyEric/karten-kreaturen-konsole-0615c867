
-- 1. Rename 'erde' to 'stein' in creature_type enum
ALTER TYPE creature_type RENAME VALUE 'erde' TO 'stein';

-- 2. Drop base_endurance column from creatures
ALTER TABLE public.creatures DROP COLUMN base_endurance;

-- 3. Add 'kind' column to skills (attack or defence)
ALTER TABLE public.skills ADD COLUMN kind text NOT NULL DEFAULT 'attack';

-- Add a validation trigger for kind values
CREATE OR REPLACE FUNCTION public.validate_skill_kind()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.kind NOT IN ('attack', 'defence') THEN
    RAISE EXCEPTION 'skill kind must be either attack or defence';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER check_skill_kind
BEFORE INSERT OR UPDATE ON public.skills
FOR EACH ROW
EXECUTE FUNCTION public.validate_skill_kind();

-- 4. Change skills.type from enum to text for combination support
ALTER TABLE public.skills ALTER COLUMN type TYPE text USING type::text;
