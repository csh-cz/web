# csh-cms-proxy — Cloudflare Worker pro Sveltia CMS

Proxy mezi `/admin/` editorem (Sveltia CMS) a GitHub API. Drží PAT bota
`cshbot`, takže editoři (Petr a kolegové) commitují, aniž by měli
GitHub účet — vidí jen Google login do Cloudflare Access.

## Jak to funguje

```
Editor (Petr / Skála / Marušák)
   ↓ Google login
Cloudflare Access (Zero Trust)
   ↓ allow-list 4 emaily
Sveltia CMS UI (/admin/index.html)
   ↓ Authorization: Bearer <fake-token>
   ↓ POST/PUT na api_root → tento Worker
csh-cms-proxy Worker (csh-cms-proxy.<account>.workers.dev)
   ├─ ověří Cf-Access-Authenticated-User-Email z headeru
   ├─ přepíše Authorization → Bearer <PAT bota>
   ├─ pro commits přepíše committer/author na bota,
   │   commit message dostane suffix [editor: petr@…]
   └─ proxy na api.github.com
GitHub API → commit do csh-cz/web (main)
   ↓ webhook
Cloudflare Pages auto-deploy
```

Frontmatter `author:` field článku **nezasahujeme** — editor si ho vyplní
sám v UI (jeho jméno se zobrazí v patičce článku jako „P. Král"). Identita
editora se **navíc** objeví v commit message v gitu (audit trail).

## Setup — manuální kroky

### 1. Vytvořit bot account `cshbot`

1. Vytvoř nový GitHub účet (čistý, jen pro bot operace) — `cshbot@orloj.eu`
   nebo podobně. Doporučení: **použít alias** na existujícím spolkovém mailu,
   ne nový account na osobní mail.
2. Pozvat ho do `csh-cz` org jako collaborator s `Write` access na `csh-cz/web`.
3. Pod tím účtem vygenerovat **fine-grained PAT**:
   - GitHub → Settings → Developer settings → Personal access tokens → Fine-grained
   - Resource owner: `csh-cz`
   - Repository access: jen `csh-cz/web`
   - Permissions: `Contents: Read and write`, `Metadata: Read-only`
   - Expiration: 1 rok (přidat reminder do TODO na obnovu)
4. Token zkopírovat — je vidět jen jednou.

### 2. Deploy Worker

```bash
cd workers/csh-cms-proxy
pnpm install      # nebo npm install (vyžaduje wrangler v package.json)
wrangler login    # OAuth do Cloudflare účtu

# Nahrát secrets
wrangler secret put GITHUB_BOT_PAT       # paste PAT z kroku 1
wrangler secret put ALLOWED_ORIGINS      # JSON: ["https://hodinarium-eu.pages.dev","https://hodinarium.eu"]

# Deploy
wrangler deploy

# Output: https://csh-cms-proxy.<account>.workers.dev
```

### 3. Aktualizovat `config.yml`

V `apps/hodinarium-eu/public/admin/config.yml`:

```yaml
backend:
  name: github
  repo: csh-cz/web
  branch: main
  api_root: 'https://csh-cms-proxy.<account>.workers.dev'  # ← URL z kroku 2
```

Commit, push, CF Pages deploy.

### 4. Nastavit Cloudflare Access

1. **Cloudflare Zero Trust dashboard** → Access → Applications → Add an application → Self-hosted
2. **Application Configuration:**
   - Name: `Hodinárium CMS`
   - Session duration: `24 hours`
   - Application domain: `hodinarium-eu.pages.dev` (po DNS switch + `hodinarium.eu`)
   - Path: `/admin*` (chytí i `/admin/`, `/admin/index.html`, `/admin/config.yml`)
3. **Identity providers:**
   - Add → Google → vyplnit Client ID/Secret z [Google Cloud Console](https://console.cloud.google.com/apis/credentials) (OAuth 2.0 Client ID).
   - Authorized redirect URI: `https://<team>.cloudflareaccess.com/cdn-cgi/access/callback`
4. **Policy:**
   - Name: `CSH editoři`
   - Action: `Allow`
   - Include: `Emails` → seznam 4 emailů (Petr, Skála, Marušák, David)

### 5. Test

1. Otevři `https://hodinarium-eu.pages.dev/admin/` v incognito — měl by se objevit Cloudflare Access login.
2. Přihlaš se Googlem (jeden z allow-list emailů).
3. Po přesměru se objeví Sveltia CMS UI s 4 collections.
4. Otevři libovolný článek, změň drobnost (např. tldr), Save.
5. Ověř commit v `csh-cz/web` na `main`:
   - Author: `cshbot`
   - Message: `Update content/... [editor: tvůj@email]`
6. Po ~90 s ověř, že CF Pages deployla a článek je live.

## Strict mode (po fungujícím setupu)

V `src/index.ts` odkomentovat:

```ts
if (!editorEmail && !url.searchParams.has('dev')) {
  return new Response('Unauthorized — CF Access required', { status: 401, headers: cors });
}
```

Pak Worker odmítne requesty bez CF Access JWT — i kdyby někdo přímo
zavolal Worker URL. Re-deploy Workeru.

## Rotace PAT

PAT má expiraci 1 rok. Kalendářní reminder + když přijde čas:

```bash
wrangler secret put GITHUB_BOT_PAT  # nový PAT
```

Worker zachytí změnu okamžitě, žádný re-deploy není třeba.

## Logs / debug

```bash
wrangler tail        # živý stream requestů
```

Pokud Sveltia hlásí 401/403 z proxy, zkontroluj:
- secret je nastavený (`wrangler secret list`)
- PAT má scope `Contents: write` na `csh-cz/web`
- bot je collaborator s Write access (ne jen Read)
- Origin je v `ALLOWED_ORIGINS` (CORS)
