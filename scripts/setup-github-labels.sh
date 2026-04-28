#!/usr/bin/env bash
# Vytvoří / aktualizuje sadu labelů pro Issue tracking v csh-cz/web.
# Idempotentní — gh label create selže jen pokud existuje s jinou
# barvou; pak ho `gh label edit` upraví.
#
# Použití:
#   bash scripts/setup-github-labels.sh
#
# Předpoklad: gh CLI nainstalovaný a `gh auth status` v pořádku.

set -euo pipefail

REPO="csh-cz/web"

declare -a LABELS=(
  # type
  'bug|d73a4a|Něco na webu nefunguje, vypadá rozbitě nebo chybí.'
  'enhancement|a2eeef|Návrh úpravy nebo nová funkce.'
  'documentation|0075ca|Změna v dokumentaci nebo komentářích.'
  'tech-debt|fbca04|Refaktor, vyčištění, modernizace bez funkční změny.'
  # status
  'status:triage|ededed|Čerstvě nahlášené, čeká na zařazení a posouzení.'
  'status:needs-info|d4c5f9|Čekáme na upřesnění od ohlašovatele.'
  'status:planned|c2e0c6|Potvrzeno k opravě, čeká na řadu.'
  'status:in-progress|0e8a16|Někdo na tom právě pracuje.'
  'status:blocked|b60205|Čekáme na třetí stranu.'
  'status:resolved|6f42c1|Opraveno, nasazeno, ověřeno.'
  # priority
  'priority:critical|b60205|Stránka nejde otevřít, regrese, bezpečnost. Dnes.'
  'priority:high|d93f0b|Funkce rozbitá, ale stránka funguje. Tento týden.'
  'priority:normal|fbca04|Vizuální / kosmetické.'
  'priority:low|c5def5|Drobnost, formulace.'
  # area
  'area:hodinarium|1d76db|Týká se hodinarium.eu.'
  'area:horologie|1d76db|Týká se horologie.cz.'
  'area:obojí|0366d6|Sdílená infrastruktura, oba weby.'
  'area:nástroje|0366d6|Build pipeline, scripty, CI, monitoring.'
)

for entry in "${LABELS[@]}"; do
  IFS='|' read -r name color desc <<< "$entry"
  if gh label create "$name" --repo "$REPO" --color "$color" --description "$desc" >/dev/null 2>&1; then
    echo "✓ vytvořen: $name"
  elif gh label edit "$name" --repo "$REPO" --color "$color" --description "$desc" >/dev/null 2>&1; then
    echo "↻ aktualizován: $name"
  else
    echo "✗ selhalo: $name" >&2
  fi
done

echo
echo "Hotovo. Seznam ověříš: gh label list --repo $REPO"
