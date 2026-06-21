# Supabase email setup

## You do NOT need SMTP (or a custom template)

As of June 2026, **new free-tier Supabase projects** cannot edit auth email templates unless you configure custom SMTP or upgrade. That is a Supabase dashboard restriction — not something broken in Cyrene.

**Good news:** signup still works with Supabase's **default** confirmation email. You only need redirect URLs (below). The cyberpunk HTML in this folder is optional polish for later if you ever add SMTP.

---

## Required: redirect URLs

In Supabase dashboard → **Authentication** → **URL Configuration**, add:

- `http://localhost:5173/link-up`
- `cyrene://link-up`

Set **Site URL** to `http://localhost:5173` during development.

When the user clicks the link in the default Supabase email, they land on `/link-up` and the app continues.

---

## Recommended for dev: skip email confirmation

If you do not want to deal with inbox checks while building:

1. **Authentication** → **Providers** → **Email**
2. Turn **off** "Confirm email"
3. Save

Signup goes straight through — no email step. Turn it back on before real users.

---

## Optional: custom template (requires SMTP or Pro)

Only if you want branded emails later:

1. Set up custom SMTP under **Authentication** → **SMTP** (Resend, SendGrid, etc.)
2. Then **Authentication** → **Email Templates** → **Confirm signup** unlocks
3. Paste `confirm-signup.html` from this folder

---

## Flow (with default Supabase email)

1. User signs up → **Verify Uplink** screen in app
2. User receives Supabase's default confirmation email (plain, but functional)
3. User clicks the confirm link
4. Desktop app opens via `cyrene://link-up` (or browser during web dev)
5. **Link-up** cinematic screen → main menu
