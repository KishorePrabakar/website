# kishorepr.vercel.app

Personal website of Kishore Prabakar, plus the **Job Radar** app (Next.js) that lives in the same repo.

The site deployed on Vercel is the **static site** at the repo root (plain HTML/CSS/JS). Routing is
driven entirely by `vercel.json`.

## Structure

```
index.html            # homepage (entry point of the static site)
assets/
  css/style.css       # shared stylesheet for every static page
  js/                 # script.js (site), conquer.js + conquer-data.js (conquer tracker)
  icons/              # favicons, touch icons, site.webmanifest
pages/                # secondary static pages: blog, projects, progress, conquer
blogs/                # individual blog posts (+ images)
neo/                  # standalone NEO pages
vercel.json           # redirects, rewrites (clean URLs + legacy paths)

app/                  # Next.js App Router: Job Radar dashboard + /radar API routes
components/           # React components (ui/, radar/)
lib/radar/            # Job Radar business logic: analyzers, scrapers, services, db schema
tests/radar/          # unit / integration / e2e tests
supabase/migration.sql
scripts/              # one-off helper scripts
docs/                 # plans, dev log, notes
```

## URLs

| URL | Serves |
| --- | --- |
| `/` | `index.html` |
| `/resume` | 307 redirect to the resume PDF (single source of truth: `redirects` in `vercel.json`) |
| `/blog`, `/projects`, `/progress`, `/conquer` | matching page in `pages/` |
| `/blogs/*.html` | blog posts |
| `/neo/*` | `neo/index.html` |

Legacy `.html` URLs (`/blog.html`, `/projects.html`, `/progess.html`, `/conquer.html`) and the old
root asset paths (`/style.css`, `/script.js`, `/favicon.ico`, ...) are still rewritten to their new
locations, so existing links keep working.

To change the resume link, edit the `redirects` entry in `vercel.json` — the Resume button on the
site points at `/resume`.

## Job Radar (Next.js)

Not currently part of the Vercel deployment (the project deploys the static site); run it locally:

```bash
npm install
cp .env.example .env.local   # fill in Supabase / Groq / Resend keys
npm run dev                  # http://localhost:3000/radar
npm run test:unit
```

See `docs/` for the implementation plan and dev log.

The `crons` entry that pointed at `/radar/update/jobs` was removed from `vercel.json`: that route
isn't part of the static deployment, and the sub-daily schedule broke every Vercel build on the
Hobby plan. Re-add it (daily at most, on Hobby) when the Next.js app is actually deployed.
