#!/usr/bin/env bash
# Suite de seguridad por fila: levanta un Postgres local desechable, simula auth de Supabase,
# aplica sql/*.sql y ejecuta ataques entre organizaciones. NO toca Supabase real.
set -euo pipefail
cd "$(dirname "$0")/.."
PGBIN=$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | tail -1 || true); [ -n "$PGBIN" ] && export PATH="$PGBIN:$PATH"
run() { if [ "$(id -u)" = 0 ]; then su postgres -c "PATH=$PATH $*"; else bash -c "$*"; fi; }
D=$(mktemp -d); trap 'run "pg_ctl -D $D stop -m immediate" >/dev/null 2>&1 || true; rm -rf "$D"' EXIT
chmod 700 "$D"; [ "$(id -u)" = 0 ] && chown postgres "$D" 2>/dev/null || true
run "initdb -D $D -U postgres -A trust >/dev/null"
run "pg_ctl -D $D -o '-p 54399 -k /tmp -c listen_addresses=' -l $D/log -w start >/dev/null"
P="psql -h /tmp -p 54399 -U postgres -v ON_ERROR_STOP=1 -q"
run "$P -d postgres -c 'create database t'" ; P="$P -d t"
run "$P -f pruebas-sql/stub-supabase.sql"
for f in sql/00*.sql; do run "$P -f $f" >/dev/null; done
run "$P -f pruebas-sql/seguridad.sql"
echo "SQL: suite de seguridad OK"
