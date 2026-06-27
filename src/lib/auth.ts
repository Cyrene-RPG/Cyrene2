import { supabase } from "./supabase";
import { getAuthRedirectUrl, setPendingLinkUp } from "./app-url";
export type SignUpInput = {
  username: string;
  email: string;
  password: string;
};

export type SignUpResult = {
  needsEmailConfirmation: boolean;
};

function formatAuthError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("already registered") || lower.includes("already exists")) {
    return "An operator with this email already exists.";
  }
  if (lower.includes("password")) {
    return "Password must be at least 6 characters.";
  }
  if (lower.includes("invalid email")) {
    return "Invalid email address.";
  }
  if (
    lower.includes("invalid login credentials") ||
    lower.includes("invalid credentials")
  ) {
    return "Invalid email or access key.";
  }
  if (lower.includes("email not confirmed")) {
    return "Confirm your email before signing in.";
  }
  if (lower.includes("username")) {
    return "That operator name is already taken.";
  }

  return message;
}

export async function isUsernameAvailable(username: string): Promise<boolean> {
  if (!supabase) return false;

  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .ilike("username", username.trim())
    .maybeSingle();

  if (error) throw new Error(formatAuthError(error.message));
  return !data;
}

export async function signUp({
  username,
  email,
  password,
}: SignUpInput): Promise<SignUpResult> {
  if (!supabase) {
    throw new Error("Database offline — Supabase is not configured.");
  }

  const trimmedUsername = username.trim().toLowerCase();
  const trimmedEmail = email.trim().toLowerCase();

  if (trimmedUsername.length < 3) {
    throw new Error("Operator name must be at least 3 characters.");
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
    throw new Error("Operator name can only use letters, numbers, _ and -.");
  }

  const available = await isUsernameAvailable(trimmedUsername);
  if (!available) {
    throw new Error("That operator name is already taken.");
  }

  const { data, error } = await supabase.auth.signUp({
    email: trimmedEmail,
    password,
    options: {
      data: { username: trimmedUsername },
      emailRedirectTo: getAuthRedirectUrl("/link-up"),
    },
  });

  if (error) throw new Error(formatAuthError(error.message));

  if (data.user && data.session) {
    await supabase.from("profiles").upsert(
      { id: data.user.id, username: trimmedUsername },
      { onConflict: "id" },
    );
    setPendingLinkUp(trimmedUsername);
  }

  const needsEmailConfirmation = !data.session;
  if (needsEmailConfirmation) {
    setPendingLinkUp(trimmedUsername);
  }

  return {
    needsEmailConfirmation,
  };
}

export async function signIn(email: string, password: string) {
  if (!supabase) {
    throw new Error("Database offline — Supabase is not configured.");
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) throw new Error(formatAuthError(error.message));
}

export async function sendPasswordReset(email: string) {
  if (!supabase) {
    throw new Error("Database offline — Supabase is not configured.");
  }

  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail) {
    throw new Error("Enter your uplink address first.");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
    redirectTo: getAuthRedirectUrl("/profile"),
  });

  if (error) throw new Error(formatAuthError(error.message));
}

export async function resendConfirmationEmail(email: string) {
  if (!supabase) {
    throw new Error("Database offline — Supabase is not configured.");
  }

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: email.trim().toLowerCase(),
    options: {
      emailRedirectTo: getAuthRedirectUrl("/link-up"),
    },
  });

  if (error) throw new Error(formatAuthError(error.message));
}
