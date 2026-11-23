# GoBase

GoBase is a Supabase-compatible service by Boggo Oy. This repository is a public fork of
[supabase/supabase](https://github.com/supabase/supabase). It customizes **Supabase Studio** so that a
self-hosted project gets a home page similar to Supabase Cloud, powered by GoBase's own data API instead of
Supabase's platform API or Logflare analytics.

These instructions add to [AGENTS.md](AGENTS.md) and [CLAUDE.md](CLAUDE.md); they do not replace them. Do not
edit Supabase's own instruction files. Put GoBase-specific guidance here.

## Branches

| Branch   | Purpose                                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------------------------- |
| `master` | Clean mirror of `upstream/master`. Never commit GoBase changes here; update only with a fast-forward from upstream. |
| `gobase` | All GoBase changes. Based on the upstream commit of the Studio image GoBase runs in production.                     |

Remotes: `origin` = `BoggoOy/gobase`, `upstream` = `supabase/supabase`.

Supabase Studio images are tagged `supabase/studio:YYYY.MM.DD-sha-<commit>`; the `<commit>` part is the upstream
commit the image was built from. `docker/versions.md` lists the tags shipped with each self-hosted release.

### Updating from upstream

1. `git fetch upstream` and fast-forward `master`.
2. Pick the Studio image tag to move to (normally the one in the newest self-hosted release in
   `docker/versions.md`).
3. On `gobase`, merge that commit: `git merge <commit>`. Resolve conflicts, keeping upstream behavior intact.
4. Run `pnpm --filter studio run typecheck`, `pnpm --filter studio run test`, then build the image.

## Public repository rules

This repository is public. Never commit:

- Secrets of any kind (API tokens, keys, passwords, connection strings with credentials).
- Internal network addresses (for example private `10.x.x.x` or `192.168.x.x` ranges), hostnames, or server names.
- Customer names, customer data, or project identifiers from real environments.
- Internal decisions, pricing, or operational details.

All environment-specific configuration comes from environment variables at runtime. Example values use
placeholders such as `https://gobase-api.example.com`.

## Code layout and change policy

- GoBase code lives in its own files, mainly under `apps/studio/components/interfaces/GoBase/`,
  `apps/studio/data/gobase/`, and `apps/studio/routes/api/gobase/`.
- Keep edits to upstream files as small as possible (ideally a few lines that switch to GoBase components), so
  upstream merges stay easy.
- GoBase features must work with `IS_PLATFORM=false` (self-hosted mode). Do not enable platform mode.
- GoBase data comes from the GoBase API through a Studio server route, so API credentials stay on the server and
  never reach the browser.
- Follow the Studio conventions in [apps/studio/AGENTS.md](apps/studio/AGENTS.md) and the skills it lists.

## Naming

- Product name in the UI: **GoBase**, described as "Supabase-compatible" (Finnish: "Supabase-yhteensopiva").
- Do not use Supabase logos or imply that GoBase is operated or endorsed by Supabase.

## License and attribution

Supabase is licensed under the [Apache License 2.0](LICENSE). Keep all existing copyright and license notices.

- When modifying an upstream file, add a short comment near the top: `// Modified by Boggo Oy for GoBase.`
- New GoBase files start with: `// Copyright Boggo Oy. Licensed under the Apache License 2.0.`
- List modified upstream files in the "Modified upstream files" section below.
- The Boggo name and logo are trademarks of Boggo Oy and are not licensed under the Apache License 2.0
  (see section 6 of the license).

## Modified upstream files

| File                                                                  | Change                                                                                                |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `apps/studio/pages/project/[ref]/index.tsx`                           | Self-hosted projects render `GoBaseHome` instead of `ProjectHome`.                                    |
| `apps/studio/components/layouts/Navigation/LayoutHeader/HomeIcon.tsx` | Header shows the Boggo logo (`public/img/gobase/boggo-logo.svg`).                                     |
| `apps/studio/hooks/custom-content/custom-content.json`                | `app:title` is `GoBase` (browser tab titles). JSON has no comments, so this table is the only marker. |
| `apps/studio/pages/_app.tsx`                                          | Favicon route `/img/gobase/favicon` and application name `GoBase`.                                    |

The TanStack route `apps/studio/routes/project/$ref/index.tsx` re-exports this page, so it needs no change.

## Configuration

The Studio server reads these environment variables at runtime. They are never exposed to the browser.

| Variable            | Example                                 | Purpose                                                                                               |
| ------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `GOBASE_API_URL`    | `https://portal.example.com/api/gobase` | Base URL of the GoBase API proxy in the GoBase portal (`http` or `https`, may include a path prefix). |
| `GOBASE_API_TOKEN`  | (secret)                                | Bearer token for the GoBase API.                                                                      |
| `GOBASE_PROJECT_ID` | `project-id`                            | Project whose data this Studio instance shows.                                                        |

Build-time, optional: `NEXT_PUBLIC_GOBASE_LOCALE` selects the UI language of the GoBase home page
(default `en`). Strings live in `apps/studio/components/interfaces/GoBase/GoBase.messages.ts`.

If the API variables are missing, the home page shows a "not configured" error instead of data.

## GoBase API contract

The home page calls the Studio route `GET /api/gobase/overview?interval=60m|24h|7d`. That route calls
`GET {GOBASE_API_URL}/v1/projects/{GOBASE_PROJECT_ID}/overview?interval=…` with
`Authorization: Bearer {GOBASE_API_TOKEN}` and validates the response against the zod schema in
`apps/studio/data/gobase/gobase-overview.schema.ts`, which is the source of truth for the contract.
Invalid responses are rejected with a 502 and only the names of the invalid fields are logged.

Fields the GoBase collector may be unable to provide for a while (`infrastructure.postgresVersion`,
`infrastructure.connections`, `requests.total`, `requests.successRate`) are nullable, and `services[].series`
may be empty. The page shows `–` for missing values instead of failing.

## TanStack Start migration

At the current base, the image is built with Next.js (`STUDIO_FRAMEWORK=next`). The GoBase API route
exists only as a Next API route (`apps/studio/pages/api/gobase/overview.ts`). When the base moves to an
upstream version without the Next runtime, add a TanStack wrapper in `apps/studio/routes/api/gobase/`
(see `routes/api/get-utc-time.ts` for the pattern). Also mirror the favicon route and application name from `pages/_app.tsx` into
`routes/__root.tsx`.

## Build

GitHub Actions builds the image on every push to `gobase` that touches Studio
(`.github/workflows/gobase-studio-image.yml`) and pushes it to the public registry
`ghcr.io/boggooy/gobase-studio` with the tag `sha-<commit>`. The image is public because the code is public
and the image contains no secrets; never pass secrets as build arguments or bake them into the image. The run summary shows the digest.
Deploy by digest (`ghcr.io/boggooy/gobase-studio@sha256:…`), never by a moving tag. The workflow uses
only `GITHUB_TOKEN` to log in to the registry; it has no other secrets.

Local build from the repository root:

```bash
docker build . -f apps/studio/Dockerfile --target production --platform linux/amd64 -t gobase-studio:dev
```

Test new images on a test machine before any production use.
