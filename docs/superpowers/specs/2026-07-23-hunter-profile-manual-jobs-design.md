# Hunter Personal App: Profile + Manual Job Input — Design

Date: 2026-07-23
Status: approved (autopilot — user unavailable, decisions recorded below)

## Goal

Turn the `/hunter` internal tool into the first iteration of a personal "job hunter app":
1. A **profile page** holding the operator's personal data (data diri) — the single source
   of truth the auto-apply engine (and later the self-hosted LLM on hc-ai) will read from.
2. The existing **applications list** stays as the record of applied jobs.
3. A **manual job input** feature — add a job by URL, description text, and/or an image
   (screenshot of the vacancy). Manual jobs enter the same `jobs` queue and can be applied
   to by the engine.

LLM integration itself is out of scope for this iteration (server-side LLM comes later);
we only make sure the data shapes are ready for it.

## Decisions (made autonomously)

- **Extend karirku**, not a new app. Data (hunter.db: 940 jobs, 41 applications), the
  hunter engine, and a working Next.js UI already live here. Repo rule: never recreate
  hunter elsewhere.
- Profile stored as one JSON document in hunter.db `settings` under key `profile`
  (schema below). No new table — single-operator tool, and the LLM consumer wants the
  whole document anyway.
- Manual jobs go into the existing `jobs` table with `platform='manual'`,
  `external_id = 'manual-' + timestamp`. New nullable column `image_path` added via
  idempotent `ALTER TABLE` in `hunter/db.js` migrate().
- Images saved under `data/uploads/` (gitignored, next to hunter.db) and served through
  `GET /api/hunter/uploads/[name]` (admin-gated like the rest of /hunter). Not `public/`
  so personal screenshots never end up in the build or repo.

## Components

### 1. Profile — `/hunter/profile`
Server page + client form (pattern: settings-form.tsx). Sections:
- **Identitas**: full_name, headline, email, phone, location, birth_date
- **Links**: github, linkedin, portfolio, jobstreet_profile
- **Ringkasan**: summary (textarea — the "penjelasan diri" used in cover letters)
- **Pendidikan**: degree, institution, field, grad_year
- **Pengalaman & skills**: years_experience_total, years_experience_mobile,
  skills (JSON array), flagship_projects (JSON array of {name, url, note})
- **Screening defaults**: salary_floor_juta (mirror of setting), english_level,
  languages, remote_preference
- API: `GET/PATCH /api/hunter/profile` → reads/writes `settings.profile` JSON,
  validated field-presence only (no over-engineering).
- Seed initial JSON from known facts (resume data) so the page is never empty.

### 2. Manual job input — `/hunter/jobs/new`
Client form posting `multipart/form-data` to `POST /api/hunter/jobs`:
- Fields: url (optional), title (required), company, location, salary_min/max, currency,
  remote (checkbox), description (textarea), image (file, optional, jpg/png/webp ≤ 5 MB)
- API stores image to `data/uploads/manual-<ts>.<ext>`, inserts job row
  (`platform='manual'`, `status='new'`, `match_score=0`, `image_path`), returns job id.
- Jobs Queue page: add "＋ Add Job" link; manual platform filter chip; show 📷 thumbnail
  link when image_path present (opens via uploads API).
- Apply flow for manual jobs stays manual for now (engine's auto-apply only supports
  jobstreet/freelancer); the row exists so the future LLM applier can pick it up.

### 3. Navigation
`/hunter` layout NAV += Profile. Jobs Queue header += Add Job button.

## Data flow

```
UI form (profile)  → PATCH /api/hunter/profile → settings.profile JSON ┐
UI form (job+img)  → POST  /api/hunter/jobs    → jobs row + data/uploads/… ┤→ future: LLM applier
existing scan/apply engine (unchanged)                                  ┘   reads profile + job
```

## Error handling
- Image: reject >5 MB or non-image MIME with 400; job insert still possible without image.
- Profile PATCH: must be valid JSON object; arrays validated with JSON.parse guard in form
  (same UX as settings form).
- Uploads route: name sanitized (`/^[\w.-]+$/`), 404 if missing; admin session required
  (inherits hunter layout gating for pages; route checks session like other hunter APIs).

## Testing
- `pnpm typecheck` + `pnpm lint` must pass.
- Manual smoke: create job with image via curl multipart, fetch it back, GET profile,
  PATCH profile, confirm rows in hunter.db.
