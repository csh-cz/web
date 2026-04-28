# Hlášení chyb a návrhů

Stránky `hodinarium.eu` a `horologie.cz` udržuje Český spolek
horologický. Bugy a nápady se sbírají jako [GitHub Issues v repu
csh-cz/web](https://github.com/csh-cz/web/issues).

## Pro běžné uživatele a členy spolku

Pokud nechcete zakládat účet na GitHubu, **napište nám e-mailem
na [info@orloj.eu](mailto:info@orloj.eu)** s tím, co jste viděli.
Co se hodí přiložit:

- **adresa stránky** (zkopírujte z prohlížeče),
- **co tam nefunguje** — stručným popisem,
- **screenshot**, pokud to dává smysl,
- **prohlížeč a operační systém** (Chrome / Safari, Mac / Windows / iPhone…).

David (správce repozitáře) z vaší zprávy založí Issue v GitHubu
a přepošle vám číslo, ať si můžete sledovat stav opravy.

## Pro vývojáře a kdo má GitHub účet

Hlaste rovnou: <https://github.com/csh-cz/web/issues/new/choose>

K dispozici jsou dvě šablony:

- **🐞 Hlášení chyby** — strukturovaný formulář (URL, očekávané
  vs. skutečné chování, závažnost, prohlížeč).
- **✨ Návrh úpravy / nová funkce** — co a proč.

## Životní cyklus Issue

Každý nový Issue prochází těmito stavy (label `status:*`):

| Stav | Význam |
|---|---|
| `status:triage` | Čerstvě nahlášené, čeká na zařazení a posouzení |
| `status:needs-info` | Potřebujeme od ohlašovatele upřesnění (čekáme) |
| `status:planned` | Potvrzeno k opravě, čeká na řadu |
| `status:in-progress` | Někdo na tom právě pracuje |
| `status:blocked` | Čekáme na třetí stranu (Petr, Cloudflare, vendor…) |
| `status:resolved` | Opraveno, nasazeno, ověřeno |

Issue se uzavírá automaticky, jakmile commit obsahující
`Fixes #N` (případně `Closes #N` / `Resolves #N`) doletí do
větve `main` a Cloudflare Pages nasadí.

## Kategorie (label `area:*`)

- `area:hodinarium` — týká se [hodinarium.eu](https://hodinarium-eu.pages.dev)
- `area:horologie` — týká se [horologie.cz](https://horologie-cz.pages.dev)
- `area:obojí` — sdílená infrastruktura, scripty, konvence
- `area:nástroje` — build pipeline, scripty v `scripts/`,
  monitoring, CI

## Závažnost (label `priority:*`)

- `priority:critical` — stránka nejde otevřít, regresní bug,
  bezpečnost. Řešíme dnes.
- `priority:high` — funkce je rozbitá, ale stránka funguje.
  Týdenní okno.
- `priority:normal` — vizuální / kosmetické. Při příští velké úpravě.
- `priority:low` — drobnost, formulace, marginálie.

## Workflow opravy (pro vývojáře)

1. **Reprodukce** — ověřit, že bug existuje na ostrém
   `*.pages.dev` (může být cache, hard refresh).
2. **Branch** — `git checkout -b fix/<issue-N>-<krátký-popis>`.
3. **Test** — pokud má smysl, doplnit do `tests/regression/`
   Playwright test, který by tu chybu chytil. Spustit
   `pnpm test:e2e` — nový test musí selhat na main, zelená
   po opravě.
4. **Commit** — `Fixes #N` v těle commit message.
5. **Push** — `git push origin fix/...`. Cloudflare Pages
   vyrobí preview deployment.
6. **Ověření** — projít opravený příklad na `<branch>.csh-cz-web.pages.dev`
   (preview URL).
7. **Merge na `main`** — Cloudflare deployne na produkci,
   Issue se sám uzavře.

## Provoz a re-crawl

Po větší dávce oprav spouštíme automatický crawl:

```sh
node_modules/.bin/tsx scripts/crawl-and-test.ts
```

Skript projede ~250 stránek napříč oběma weby a aktualizuje
[BUGS.md](BUGS.md) (souhrnný report — ne tracking). Slouží
hlavně k odhalení regresí v odkazech a obrázcích.
