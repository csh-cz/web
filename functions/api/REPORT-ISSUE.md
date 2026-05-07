# Editor report flow — `/api/report-issue`

## Co to dělá

Editor klikne na floating tlačítko **„Nahlásit problém"** (vpravo dole),
vyplní typ problému + popis, klikne Odeslat. Pages Function vytvoří
GitHub Issue v repu webu s labely (default `web-bug`, `editor-report`)
a vrátí číslo + URL issue. Editor vidí potvrzení s odkazem.

## Architektura

```
[ReportIssueModal.astro] (Base.astro globálně, FAB skrytý pro anon)
   ↓ form submit → POST /api/report-issue
   ↓ JSON { url, pageTitle, problemType, description, _url (honeypot) }
[functions/api/report-issue.ts]
   ├─ čte editora z `Cf-Access-Authenticated-User-Email` (CF Access guard)
   ├─ honeypot `_url` empty? rate-limit? validate?
   ├─ POST https://api.github.com/repos/{owner}/{repo}/issues
   │   Authorization: Bearer ${GITHUB_TOKEN || GITHUB_BOT_PAT}
   └─ vrátí { ok: true, issue: { number, url } }
```

## Setup

### 1. Cloudflare Access policy

**Není povinné**, ale doporučené pro lepší výkon. Endpoint má dvojí auth:

1. **Fast path** — pokud `/api/report-issue` je v CF Access policy
   coverage, CF doručí `Cf-Access-Authenticated-User-Email` header přímo.
2. **Fallback** — když header chybí, endpoint server-side proxy fetchne
   `/api/cms/auth/user` (který v Access coverage je) s forward-nutými
   cookies a získá email z odpovědi. +1 HTTP roundtrip (~50 ms).

Pro fast path: dash → Zero Trust → Access → Applications → ČSH editor
app → Application path: přidej rule pokrývající
`hodinarium-eu.pages.dev/api/report-issue`. Bez toho fallback funguje
bez změny — uživatel pozná jen mírně delší odezvu.

### 2. GitHub PAT (pokud ještě není)

`GITHUB_BOT_PAT` už existuje pro CMS proxy — endpoint ho znovupoužije
pokud `GITHUB_TOKEN` není explicitně set. Token musí mít:

- **classic PAT**: scope `repo` (private) nebo `public_repo` (public)
- **fine-grained PAT**: Issues: Read & Write na cílový repozitář

### 3. Pages Function env vars

V Cloudflare dash → Pages → hodinarium-eu → Settings → Environment
variables (Production):

| Variable                  | Default              | Required |
|---------------------------|----------------------|----------|
| `GITHUB_TOKEN`            | (fallback BOT_PAT)   | ne       |
| `GITHUB_BOT_PAT`          | —                    | ano (Secret) |
| `GITHUB_OWNER`            | `csh-cz`             | ne       |
| `GITHUB_REPO`             | `csh-cz/web`         | ne       |
| `GITHUB_DEFAULT_LABELS`   | `web-bug,editor-report` | ne    |
| `TURNSTILE_SECRET_KEY`    | (disabled)           | ne       |

## Anti-spam

1. **Editor-only access** — CF Access OTP gating, anonymní 401.
2. **Honeypot field** `_url` — vizuálně skrytý, boti často vyplní all
   inputy → server tichý 200 (žádný signál, že to zafungovalo).
3. **Per-isolate rate limit** — 30 s mezi reporty per editor email.
   Best-effort; isolaty se rotují, ale stačí proti dvojklikům a primitivním
   smyčkám.
4. **Cloudflare Turnstile** (placeholder) — pokud bude potřeba, set
   `TURNSTILE_SECRET_KEY` v env. Frontend musí navíc poslat
   `cf-turnstile-response` v body. Bez secret-key endpoint Turnstile skipne.

## Validace

- `description`: required, **5–2000** znaků (klient minlength + server clamp)
- `problemType`: jen z allowlist `PROBLEM_TYPES`:
  `preklep | chybejici-info | spatny-obrazek | technicka-chyba | metadata | duplicita | jine`
- `url`: max 500 znaků, musí být `http(s)://…`
- `pageTitle`: max 200 znaků, volitelný
- `userAgent`: čteme z request headeru, max 500 znaků

## Bezpečnost — co se NIKDY neposílá do GitHubu

- Cookies (Cf-Access-Jwt, session…)
- Auth headers, interní tokeny
- IP adresa (pouze logovaná pro spam detection, ne v issue body)
- Browser fingerprint mimo viditelný User-Agent string

## Issue formát

```
Title: [Web bug] Krátký popis nebo název stránky

## Hlášení od editora

- **URL:** <https://hodinarium-eu.pages.dev/sbirka/karta/inv-2-…>
- **Název stránky:** věžní Prokeš 1868 soubor
- **Typ problému:** překlep / typografická chyba (`preklep`)
- **Hlásí:** editor@example.com
- **Datum a čas:** 2026-05-06T22:13:52.482Z
- **User-Agent:** `Mozilla/5.0 (Macintosh…) Safari/605.1.15`

## Popis problému

V perexu je „desetiletí" místo „desetilelí" – ale to platí …

---

_Automaticky vytvořeno přes editorský report flow (`/api/report-issue`)._

Labels: web-bug, editor-report
```

## Testování lokálně

```bash
# 1. Build
pnpm --filter hodinarium-eu build

# 2. Local Pages dev (potřebuješ wrangler env vars)
cd apps/hodinarium-eu
GITHUB_BOT_PAT=ghp_xxx \
  pnpm wrangler pages dev dist --binding GITHUB_BOT_PAT="$GITHUB_BOT_PAT"

# 3. Curl test (CF Access header musíš přimulovat lokálně)
curl -X POST http://localhost:8788/api/report-issue \
  -H 'Content-Type: application/json' \
  -H 'Cf-Access-Authenticated-User-Email: test@example.com' \
  -d '{
    "url": "http://localhost:8788/test",
    "pageTitle": "Test stránka",
    "problemType": "preklep",
    "description": "Smoke test report flow"
  }'
```

Lokálně bez CF Access guardu jednoduše header naset rukou.
V produkci CF Access ho doplní automaticky.
