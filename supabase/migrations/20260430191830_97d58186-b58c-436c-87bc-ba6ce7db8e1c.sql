
-- Enums
CREATE TYPE public.creature_type AS ENUM ('feuer', 'wasser', 'erde', 'luft', 'blitz', 'eis', 'gift', 'licht', 'schatten');
CREATE TYPE public.creature_rarity AS ENUM ('gewoehnlich', 'selten', 'episch', 'legendaer');
CREATE TYPE public.creature_form AS ENUM ('standard', 'spezial');
CREATE TYPE public.skill_tier AS ENUM ('standard', 'selten', 'super', 'episch');

-- Creatures table
CREATE TABLE public.creatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type creature_type NOT NULL,
  rarity creature_rarity NOT NULL DEFAULT 'gewoehnlich',
  form creature_form NOT NULL DEFAULT 'standard',
  base_strength INTEGER NOT NULL DEFAULT 10,
  base_speed INTEGER NOT NULL DEFAULT 10,
  base_endurance INTEGER NOT NULL DEFAULT 10,
  base_magic INTEGER NOT NULL DEFAULT 10,
  max_active_skills INTEGER NOT NULL DEFAULT 3,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Skills table
CREATE TABLE public.skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  tier skill_tier NOT NULL DEFAULT 'standard',
  type creature_type NOT NULL,
  stat_affected TEXT NOT NULL DEFAULT 'strength',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Creature Skills (which skills a creature type can unlock)
CREATE TABLE public.creature_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creature_id UUID NOT NULL REFERENCES public.creatures(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  unlock_order INTEGER NOT NULL DEFAULT 1,
  UNIQUE(creature_id, skill_id)
);

-- NFC Cards
CREATE TABLE public.nfc_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  uid TEXT NOT NULL UNIQUE,
  creature_id UUID NOT NULL REFERENCES public.creatures(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  first_scanned_at TIMESTAMP WITH TIME ZONE
);

-- Card Instances (living creature on a card)
CREATE TABLE public.card_instances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nfc_card_id UUID NOT NULL REFERENCES public.nfc_cards(id) ON DELETE CASCADE UNIQUE,
  creature_id UUID NOT NULL REFERENCES public.creatures(id) ON DELETE CASCADE,
  skill_points INTEGER NOT NULL DEFAULT 0,
  unlocked_skills UUID[] DEFAULT '{}',
  active_skills UUID[] DEFAULT '{}',
  battles_fought INTEGER NOT NULL DEFAULT 0,
  training_sessions INTEGER NOT NULL DEFAULT 0,
  last_trained_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS: Disable for admin tool (no auth required for dev tool)
ALTER TABLE public.creatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creature_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nfc_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_instances ENABLE ROW LEVEL SECURITY;

-- Public access policies for dev/admin tool
CREATE POLICY "Public full access on creatures" ON public.creatures FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on skills" ON public.skills FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on creature_skills" ON public.creature_skills FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on nfc_cards" ON public.nfc_cards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on card_instances" ON public.card_instances FOR ALL USING (true) WITH CHECK (true);
