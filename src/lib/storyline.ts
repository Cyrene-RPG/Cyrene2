import { supabase } from "./supabase";

export type MainStorylineChoice = "yes" | "no";

export type StorylineRecord = {
  id: string;
  username: string;
  created_at: string;
  main_storyline_choice: MainStorylineChoice | null;
  main_storyline_decided_at: string | null;
};

export async function fetchStorylineChoice(
  userId: string,
): Promise<MainStorylineChoice | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("main_storyline_choice")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data?.main_storyline_choice as MainStorylineChoice | null) ?? null;
}

export async function saveMainStorylineChoice(
  choice: MainStorylineChoice,
): Promise<void> {
  if (!supabase) {
    throw new Error("Database offline — Supabase is not configured.");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("No active session.");

  const { data, error } = await supabase
    .from("profiles")
    .update({
      main_storyline_choice: choice,
      main_storyline_decided_at: new Date().toISOString(),
    })
    .eq("id", user.id)
    .is("main_storyline_choice", null)
    .select("id")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) {
    throw new Error("Storyline choice has already been recorded.");
  }
}

export async function fetchAllStorylineRecords(): Promise<StorylineRecord[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, username, created_at, main_storyline_choice, main_storyline_decided_at",
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as StorylineRecord[];
}

/** Dev-only: clear the current user's storyline choice so the prompt can be replayed. */
export async function resetStorylineChoiceForDev(): Promise<void> {
  if (!import.meta.env.DEV) return;
  if (!supabase) {
    throw new Error("Database offline — Supabase is not configured.");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("Log in first to replay the storyline prompt.");

  const { error } = await supabase
    .from("profiles")
    .update({
      main_storyline_choice: null,
      main_storyline_decided_at: null,
    })
    .eq("id", user.id);

  if (error) throw new Error(error.message);
}
