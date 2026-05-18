# Push Vouch to GitHub

The project is a **standalone git repo** (not tied to your home-directory git). Package name is `vouch`; display name is **Vouch**.

## One-time: create the repo and push

### Option A — GitHub CLI (recommended)

```bash
cd /path/to/Vouch   # this project folder

gh auth login       # browser login, once

gh repo create Vouch --public --source=. --remote=origin --push --description "Trusted places your friends actually recommend"
```

Repo URL will be: `https://github.com/YOUR_USERNAME/Vouch`

### Option B — GitHub website

1. Go to [github.com/new](https://github.com/new)
2. Repository name: **Vouch**
3. Public or Private — your choice
4. **Do not** add README, .gitignore, or license (already in the project)
5. Create repository, then:

```bash
cd /path/to/Vouch

git remote add origin https://github.com/YOUR_USERNAME/Vouch.git
git push -u origin main
```

## After the first push

```bash
git add -A
git commit -m "Your message"
git push
```

If `git commit` fails with `unknown option trailer`, use:

```bash
/usr/local/bin/git commit -m "Your message"
```

(Cursor sometimes wraps `git commit` with extra flags.)

## Connect Vercel

Vercel → **Import** → select **Vouch** repo → add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` → Deploy.
