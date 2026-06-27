import { supabase } from "./supabase";

export type Profile = {
  id: string;
  username: string;
  created_at: string;
  is_admin?: boolean;
};

export async function fetchProfile(userId: string): Promise<Profile | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, created_at, is_admin")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function signOutOperator() {
  if (!supabase) throw new Error("Database offline — Supabase is not configured.");
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}
