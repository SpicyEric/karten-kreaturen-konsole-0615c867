
ALTER TABLE public.creatures
  ADD COLUMN IF NOT EXISTS max_skill_points integer NOT NULL DEFAULT 15;

UPDATE public.creatures SET max_skill_points = CASE rarity
  WHEN 'gewoehnlich' THEN 15
  WHEN 'selten' THEN 20
  WHEN 'episch' THEN 25
  WHEN 'legendaer' THEN 30
  ELSE 15
END;

ALTER TABLE public.card_instances
  ADD COLUMN IF NOT EXISTS current_skill_points integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.validate_current_skill_points()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  max_pts integer;
BEGIN
  IF NEW.current_skill_points < 0 THEN
    RAISE EXCEPTION 'current_skill_points cannot be negative';
  END IF;
  SELECT max_skill_points INTO max_pts FROM public.creatures WHERE id = NEW.creature_id;
  IF max_pts IS NOT NULL AND NEW.current_skill_points > max_pts THEN
    RAISE EXCEPTION 'current_skill_points (%) exceeds creature max_skill_points (%)', NEW.current_skill_points, max_pts;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_current_skill_points ON public.card_instances;
CREATE TRIGGER trg_validate_current_skill_points
  BEFORE INSERT OR UPDATE ON public.card_instances
  FOR EACH ROW EXECUTE FUNCTION public.validate_current_skill_points();
