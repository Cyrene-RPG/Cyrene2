-- Dice-derived operator identification on saved avatars

alter table public.operator_avatars
  add column if not exists stat_dice_rolls jsonb,
  add column if not exists identification_number text;
