-- Rename base_magic to base_intelligence
ALTER TABLE public.creatures RENAME COLUMN base_magic TO base_intelligence;

-- Update validate_skill_kind to allow 'support'
CREATE OR REPLACE FUNCTION public.validate_skill_kind()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.kind NOT IN ('attack', 'defence', 'support') THEN
    RAISE EXCEPTION 'skill kind must be attack, defence, or support';
  END IF;
  RETURN NEW;
END;
$function$;

-- Ensure trigger exists on skills
DROP TRIGGER IF EXISTS validate_skill_kind_trigger ON public.skills;
CREATE TRIGGER validate_skill_kind_trigger
  BEFORE INSERT OR UPDATE ON public.skills
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_skill_kind();