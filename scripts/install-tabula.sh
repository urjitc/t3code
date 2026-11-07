#!/bin/zsh
# Installs the newest release/Tabula-Rasa-*-arm64.dmg over /Applications/Tabula Rasa.app.
# Detaches first so it survives quitting Tabula, which kills agents running inside it.
set -euo pipefail

repo=${0:A:h:h}
log=$repo/release/install-tabula.log

if [[ ${TABULA_INSTALL_DETACHED:-} != 1 ]]; then
  TABULA_INSTALL_DETACHED=1 nohup perl -MPOSIX -e 'fork and exit; POSIX::setsid(); exec @ARGV' \
    "$0" >"$log" 2>&1 </dev/null &
  echo "Installer detached; log at $log"
  exit 0
fi

dmg=$(ls -t "$repo"/release/Tabula-Rasa-*-arm64.dmg | head -1)
sleep 2
osascript -e 'quit app "Tabula Rasa"' || true
while pgrep -xq "Tabula Rasa"; do sleep 1; done

mount=$(hdiutil attach -nobrowse "$dmg" | tail -1 | cut -f3)
rm -rf "/Applications/Tabula Rasa.app"
ditto "$mount/Tabula Rasa.app" "/Applications/Tabula Rasa.app"
hdiutil detach -quiet "$mount"
open "/Applications/Tabula Rasa.app"
echo "Installed $dmg"
