#!/usr/bin/env bash
# cf-access-allowlist.sh — správa CSH editoři Access Group v Cloudflare Zero Trust.
#
# Editace povolených emailů na /admin/ + Worker URL.
# Group referencují obě Access Applications, takže změna v Group
# se okamžitě propisuje do obou.
#
# Vyžaduje: CLOUDFLARE_API_TOKEN v env (broader scope, vidí Access).
#
# Usage:
#   ./scripts/cf-access-allowlist.sh list
#   ./scripts/cf-access-allowlist.sh add petr@orloj.eu
#   ./scripts/cf-access-allowlist.sh add petr@orloj.eu baudisch@nekde.cz
#   ./scripts/cf-access-allowlist.sh remove old@email.com

set -euo pipefail

ACC=d5c001b051b45963d51ca37765b774c3
GROUP_ID=98782332-e0c8-42cb-bf22-fbb1f1bbf549
GROUP_NAME="CSH editoři"

if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
  echo "ERROR: CLOUDFLARE_API_TOKEN env var není nastaven." >&2
  echo "Source ~/.zprofile nebo export ručně." >&2
  exit 1
fi

api() {
  local method="$1" path="$2" body="${3:-}"
  if [ -n "$body" ]; then
    curl -sf -X "$method" "https://api.cloudflare.com/client/v4$path" \
      -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
      -H "Content-Type: application/json" \
      -d "$body"
  else
    curl -sf -X "$method" "https://api.cloudflare.com/client/v4$path" \
      -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN"
  fi
}

get_emails() {
  api GET "/accounts/$ACC/access/groups/$GROUP_ID" \
    | python3 -c "import sys,json; [print(i['email']['email']) for i in json.load(sys.stdin)['result'].get('include',[]) if 'email' in i]"
}

set_emails() {
  # arg = newline-separated list of emails
  local emails="$1"
  local include_json
  include_json=$(echo "$emails" | python3 -c "
import sys, json
emails = [l.strip() for l in sys.stdin if l.strip()]
print(json.dumps([{'email': {'email': e}} for e in emails]))
")
  api PUT "/accounts/$ACC/access/groups/$GROUP_ID" \
    "{\"name\": \"$GROUP_NAME\", \"include\": $include_json}" \
    | python3 -c "import sys,json; d=json.load(sys.stdin); print('OK' if d.get('success') else 'FAIL:', d.get('errors',''))"
}

case "${1:-}" in
  list)
    echo "Allow-list (Access Group '$GROUP_NAME'):"
    get_emails | sed 's/^/  /'
    ;;

  add)
    shift
    if [ $# -eq 0 ]; then
      echo "Usage: $0 add <email> [email2 ...]" >&2
      exit 1
    fi
    current=$(get_emails)
    for email in "$@"; do
      current+=$'\n'"$email"
    done
    new=$(echo "$current" | sort -u)
    echo "Nové allow-list:"
    echo "$new" | sed 's/^/  /'
    set_emails "$new"
    ;;

  remove)
    shift
    if [ $# -eq 0 ]; then
      echo "Usage: $0 remove <email> [email2 ...]" >&2
      exit 1
    fi
    current=$(get_emails)
    new="$current"
    for email in "$@"; do
      new=$(echo "$new" | grep -vF "$email" || true)
    done
    echo "Nové allow-list:"
    echo "$new" | sed 's/^/  /'
    set_emails "$new"
    ;;

  *)
    echo "Usage: $0 {list|add|remove} [emails...]"
    echo
    echo "Příklady:"
    echo "  $0 list"
    echo "  $0 add petr@orloj.eu"
    echo "  $0 add petr@orloj.eu baudisch@email.cz"
    echo "  $0 remove old@email.cz"
    exit 1
    ;;
esac
