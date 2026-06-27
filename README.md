# Cyrene

Interactive cyber-fantasy RPG — React desktop app with Supabase backend.

## Stack

- **Desktop:** Electron (Windows `.exe` installer)
- **Frontend:** Vite + React + TypeScript
- **Backend:** Supabase (Auth + Postgres)

---

## Part 1 — Create your Supabase project (free)

You only do this once.

### 1. Sign up

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign up with GitHub, Google, or email

### 2. Create a project

1. Click **New project**
2. Pick an organization (or create one)
3. Fill in:
   - **Name:** `cyrene` (or anything you like)
   - **Database password:** choose a strong password and **save it somewhere safe**
   - **Region:** pick the closest to you (e.g. `East US`)
4. Click **Create new project** and wait ~2 minutes for it to finish provisioning

### 3. Copy your API keys

1. In the left sidebar, go to **Project Settings** (gear icon) → **API**
2. Copy these two values:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### 4. Add keys to this project

In the `Cyrene2` folder:

```bash
copy .env.example .env
```

Open `.env` and paste your real values:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5. Enable email sign-up

1. In Supabase dashboard → **Authentication** → **Providers**
2. Make sure **Email** is enabled (it is by default)
3. Go to **Authentication** → **URL Configuration** and add redirect URLs:
   - `http://localhost:5173/link-up`
   - `cyrene://link-up`
4. Set **Site URL** to `http://localhost:5173` during development

**Email templates:** New free projects cannot customize auth emails without custom SMTP (Supabase policy since June 2026). You do **not** need SMTP — the default Supabase confirmation email works fine. See `supabase/email-templates/README.md`.

**Easier dev testing:** Under **Providers** → **Email**, turn off **Confirm email** so signup skips the inbox step.

### 6. Run the database migration

1. In Supabase dashboard → **SQL Editor**
2. Click **New query**
3. Open `supabase/migrations/20250618000000_create_profiles.sql` from this repo
4. Paste the full SQL into the editor
5. Click **Run**

This creates the `profiles` table (replaces the old Firebase `users` collection).

**If signup or username checks are failing** (broken table, missing rows, duplicate errors), run the repair script in the same SQL Editor:

1. Open `supabase/migrations/20250619000000_repair_profiles.sql`
2. Paste and **Run** (safe to run more than once)

This fixes RLS policies, grants, the signup trigger, case-insensitive username uniqueness, and backfills missing profile rows.

---

## Part 2 — Run Cyrene as a PC app

### Install dependencies

```bash
npm install
```

### Development (desktop window + hot reload)

```bash
npm run dev
```

This opens the Cyrene window on your PC and reloads when you edit code.

### Development (browser only)

```bash
npm run dev:web
```

Opens at [http://localhost:5173](http://localhost:5173) in your browser instead.

### Build a Windows installer

```bash
npm run dist:win
```

When it finishes, find the installer in the `release/` folder (`.exe` setup file).

### Install Cyrene on your PC (auto-updating)

1. Open [GitHub Releases](https://github.com/Cyrene-RPG/Cyrene2/releases)
2. Download the latest **`Cyrene Setup x.x.x.exe`** from the release matching your track:
   - **`main` releases** → stable channel (`latest`)
   - **`test` releases** → beta channel (pre-releases)
3. Run the installer and launch Cyrene from the Start Menu or desktop shortcut

The installed app checks GitHub for updates on launch. You can also open **System Settings** from the main menu and use **Check for updates**. When a build is ready, click **Restart & update**.

**How updates ship**

| Branch | Channel | When it publishes |
| --- | --- | --- |
| `main` | `latest` (stable) | Every push to `main` |
| `test` | `beta` (pre-release) | Every push to `test` |

CI builds version `0.1.<build-number>`, uploads the Windows installer to GitHub Releases, and the desktop client pulls from there automatically.

**Publish manually from your machine** (requires a GitHub token with repo access):

```bash
set GH_TOKEN=your_github_token
npm run publish:win
```

Beta track:

```bash
set GH_TOKEN=your_github_token
npm run publish:win:beta
```

Windows may show SmartScreen on first install until the app is code-signed — that is expected for unsigned builds.

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Desktop app with hot reload |
| `npm run dev:web` | Browser dev server only |
| `npm run build` | Production web build |
| `npm run app` | Run built app without installer |
| `npm run dist:win` | Build Windows `.exe` installer (stable channel) |
| `npm run dist:win:beta` | Build Windows installer for beta update channel |
| `npm run publish:win` | Build + upload stable release to GitHub |
| `npm run publish:win:beta` | Build + upload beta pre-release to GitHub |

---

## Project layout

```
Cyrene2/
├── electron/          # Desktop app shell
├── src/               # React app (homepage first)
├── public/            # Legacy HTML pages + images
├── supabase/          # Database migrations
└── release/           # Built Windows installer (after dist:win)
```

## What's next

- Code-sign the Windows installer to reduce SmartScreen warnings
- Migrate remaining legacy HTML pages to React
- Remove legacy Firebase files when migration is complete
