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
api/resume.js         # serverless function behind /resume
vercel.json           # rewrites (clean URLs + legacy paths), function config
scripts/dev-server.js # local server that mimics the Vercel routing

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
| `/resume` | serverless function `api/resume.js`: reads the Resume button's `href` out of `index.html` and 302s to it (`/resume?format=json` returns `{ label, resumeUrl }`) |
| `/blog`, `/projects`, `/progress`, `/conquer` | matching page in `pages/` |
| `/blogs/*.html` | blog posts |
| `/neo/*` | `neo/index.html` |

Legacy `.html` URLs (`/blog.html`, `/projects.html`, `/progess.html`, `/conquer.html`) and the old
root asset paths (`/style.css`, `/script.js`, `/favicon.ico`, ...) are still rewritten to their new
locations, so existing links keep working.

To change the resume link, edit the `<a id="resume-link">` href in `index.html` — `/resume` follows
it automatically, nothing else to update.

## Local development

```bash
node scripts/dev-server.js 3000   # serves the repo the way Vercel does
```

It applies `vercel.json`'s redirects/rewrites in Vercel's order (filesystem first, then rewrites) and
runs `api/*.js` as functions, so `/resume`, the clean URLs, and the legacy paths all behave locally
as they do in production.

## Job Radar (Next.js)

Not part of the Vercel deployment. `vercel.json` pins the deployment to a static build of the repo
root (`"framework": null`, empty build command); otherwise Vercel auto-detects Next.js and the build
fails at `Collecting page data` because the radar routes construct their Supabase client at module
load with no env vars set — which is why deployments have been failing and the live site was stuck on
an old build. Run the radar app locally instead:

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
