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

## Important: no login yet

Right now Client View and Producer Backend are just two tabs in the same
app — there's no password separating them, same as the Claude-artifact
version. Anyone with the link can technically flip to Producer Backend and
edit. That matches how it worked before, but if you want real access
control (a producer login, a read-only client link), that's a follow-up
step — let me know and I'll add Supabase Auth.

## Migrating your existing data

Once this is live, tell me and I'll help pull over whatever's already
entered in the Claude version (episodes, interviews, production days) so
you're not starting from scratch.
