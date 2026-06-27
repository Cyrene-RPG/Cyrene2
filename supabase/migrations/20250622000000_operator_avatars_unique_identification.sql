-- Ensure operator IDs are globally unique once assigned.

create unique index if not exists operator_avatars_identification_number_unique
  on public.operator_avatars (identification_number)
  where identification_number is not null;
