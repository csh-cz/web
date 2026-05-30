# Setup Cloudflare Web Analytics

Návod pro aktivaci CF Web Analytics beacon na webech `hodinarium-eu` a `horologie-cz`.

## Stav

Kód v obou apps už beacon obsahuje (`apps/*/src/layouts/Base.astro`), čeká jen na env proměnnou `PUBLIC_CF_ANALYTICS_TOKEN` v Cloudflare Pages settings. Bez tokenu se script-tag vůbec nevyrenderuje — žádný no-op overhead.

```astro
{cfAnalyticsToken && (
  <script is:inline defer
    src="https://static.cloudflareinsights.com/beacon.min.js"
    data-cf-beacon={`{"token": "${cfAnalyticsToken}"}`}></script>
)}
```

## Co se sbírá (GDPR-friendly)

CF Web Analytics je **bez cookies**, **bez fingerprinting**, **bez IP loggingu**. GDPR-compliant out-of-the-box. Sbírá:

- Page views (počet, top stránky)
- Visitors (unikátní, ale bez identifikace)
- Referrers (odkud návštěvník přišel)
- Top countries (z geo Cloudflare edge serveru)
- Browser / OS aggregates (% Chrome, % iOS, …)
- Core Web Vitals (LCP, FID, CLS — výkon stránky)

**Neopovídá za:** per-visitor sessions, scroll depth, click heatmaps, A/B testing. Pro to bys potřeboval Umami/Plausible/PostHog.

## Kroky (každý web zvlášť — 2× postup)

### A) Vytvořit site v CF Web Analytics

1. https://dash.cloudflare.com/ → tvůj account
2. **Analytics & Logs → Web Analytics**
3. **Add a site** → URL `https://hodinarium-eu.pages.dev` (resp. později `hodinarium.eu` po DNS switch)
4. Vyber **Free plan** (nepotřebuješ Business)
5. CF vygeneruje **site_tag** (32-char hex string typu `abc123def456...`)
6. **Zkopíruj site_tag**

Opakuj pro `horologie-cz.pages.dev` → druhý site_tag.

### B) Nastavit env v CF Pages

Pro `hodinarium-eu`:

1. CF Dashboard → **Workers & Pages → hodinarium-eu**
2. **Settings → Environment Variables**
3. **Production** sloupec → **Add variable**
4. Variable name: `PUBLIC_CF_ANALYTICS_TOKEN`
5. Value: `<site_tag z kroku A>`
6. **Save**

Opakuj pro `horologie-cz` s **druhým site_tagem** (každý web má vlastní).

### C) Redeploy

CF Pages env proměnné se neaplikují na live build — musíš trigger redeploy:

**Možnost 1: push nového commitu** (přirozené, projde celý CI)
```bash
# Cokoli triviální (např. README touch) → push → CI build → live
```

**Možnost 2: manual retry v dashboardu** (rychlejší, bez nového commitu)
1. CF Pages → hodinarium-eu → **Deployments**
2. U posledního deploymentu **... menu → Retry deployment**
3. Stejné pro horologie-cz

### D) Verify

1. Otevři `https://hodinarium-eu.pages.dev/` v prohlížeči
2. View source → hledej `cloudflareinsights.com/beacon.min.js` ve `<head>`
3. Pokud tam je s tvým site_tagem → beacon je aktivní
4. Network tab → měl bys vidět POST request na `https://cloudflareinsights.com/cdn-cgi/rum`

Data v dashboardu se objeví **do 15 minut** od prvních hitů.

### E) Sledování dat

CF Dashboard → **Analytics & Logs → Web Analytics → hodinarium-eu** (resp. horologie-cz) — graf návštěvnosti, top pages, referrers, geo, core web vitals.

## Pozn. ke konfiguraci

- **`is:inline`** v Astro znamená "nezpracovávej skript přes Vite bundler" — pro 3rd-party tracker scripts s `src` to je správně (jinak by Vite zkoušel resolvnout external URL jako modul).
- **`defer`** atribute — skript se nahraje po DOMContentLoaded, neblokuje rendering.
- **`spa` mode** — Astro je MPA (multi-page), takže každá navigace = full page reload = nový beacon hit. Pokud bychom přešli na View Transitions / SPA mode, museli bychom přidat `"spa": true` do `data-cf-beacon` JSONu. Zatím není potřeba.

## Alternativy (pokud by CF nestačilo)

- **Umami** (self-hosted, ~$0, plně privacy-respecting) — vlastní instance na Vercel/Railway
- **Plausible** (managed, ~$9/měsíc starting) — privacy-first, jednoduché UI
- **PostHog** (managed nebo self-hosted) — víc features (session replay, A/B), ale komplexnější

Pro orlojový spolkový web jsou CF Web Analytics **více než dostačující** — zdarma, žádná setup režie, žádné GDPR komplikace.
