# For the Love — Tracker (standalone version)

This is the standalone version of the documentary tracker, wired to a real
Supabase database instead of the temporary storage used inside Claude.
Client View and Producer Backend both live here, and changes now sync live
to everyone viewing the site, not just people in the same Claude chat.

## 1. Set up the database (Supabase)

1. Open your Supabase project → **SQL Editor** → **New query**.
2. Paste in the entire contents of `supabase-schema.sql` (in this folder) and click **Run**.
3. Go to **Project Settings → API**. You'll need two values from this page in step 3 below:
   - **Project URL**
   - **anon public** key

## 2. Upload this project to GitHub

1. Open your empty GitHub repo.
2. Click **Add file → Upload files**.
3. Drag this entire folder's contents in (everything except `node_modules`,
   which doesn't exist yet anyway) and commit.

## 3. Deploy on Vercel

1. In Vercel, **Add New Project → Import** your GitHub repo.
2. Vercel will auto-detect Next.js — leave the build settings as default.
3. Before deploying, open **Environment Variables** and add:
   - `NEXT_PUBLIC_SUPABASE_URL` → your Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → your Supabase anon public key
4. Click **Deploy**. You'll get a working `*.vercel.app` link — open it and
   confirm the tracker loads and Producer Backend > Episodes shows your
   10 episodes.

## 4. Point your domain at it (Bluehost)

1. In Bluehost, go to your domain's **DNS / Zone Editor**.
2. Add a **CNAME** record: host = `tracker` (or whatever subdomain you want),
   value = `cname.vercel-dns.com`.
3. In Vercel → your project → **Settings → Domains**, add that same subdomain
   (e.g. `tracker.yourdomain.com`).
4. Wait for DNS to propagate (usually minutes, sometimes a few hours) — SSL
   is issued automatically once it does.

## Important: producers now need a real login

Producer Backend is now locked behind a real sign-in (Supabase Auth) —
Client View stays fully open with no account needed, but Producer Backend
shows a sign-in screen until someone logs in. This is enforced at the
database level too (not just hidden in the UI), so it's real security, not
just a locked door with the key under the mat.

### Adding your team as producers/editors

1. In Supabase → **Authentication → Users → Add user**.
2. Enter their email and set a temporary password (or use "Send invite
   email" if you've set up email sending — otherwise just tell them the
   password directly and have them change it later).
3. Repeat for each producer/editor who needs access.
4. In **Authentication → Settings**, make sure **"Enable sign ups"** is
   turned **off** — this stops anyone else from creating their own account
   through the login form. You control who gets in by adding them manually
   in step 1–2.

## Migrating your existing data

1. In the **old Claude-artifact tracker**, go to **Producer Backend → Home**
   and click **Export All Data**. Copy the whole block shown.
2. On the **new standalone site**, sign in to Producer Backend, go to
   **Home**, click **Import Data**, paste in what you copied, and click
   **Import & Overwrite**. This replaces everything currently in the new
   site with your real data.
3. Double check Client View afterward — your real episodes, interviews, and
   production days should now show up there.

**Do this once, from the old tracker to the new one, then stop using the
Claude-artifact version** — from that point on, the standalone site is the
single source of truth. Producer Backend also has an **Export Data** button
going forward, useful as a periodic backup even after migration.
