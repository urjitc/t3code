#!/bin/zsh
# Signs a Tabula Rasa build with the local "Tabula Rasa Local Signing" certificate, so macOS
# keeps Accessibility, Screen Recording, Automation and Full Disk Access grants across rebuilds.
# Agents inherit those grants. Usage: scripts/sign-tabula.sh "/Applications/Tabula Rasa.app"
#
# To recreate the certificate (a new one means granting the permissions once more):
#   openssl req -x509 -newkey rsa:2048 -nodes -days 3650 -keyout key.pem -out cert.pem \
#     -subj "/CN=Tabula Rasa Local Signing" -addext "extendedKeyUsage=critical,codeSigning" \
#     -addext "keyUsage=critical,digitalSignature" -addext "basicConstraints=critical,CA:false"
#   openssl pkcs12 -export -legacy -inkey key.pem -in cert.pem -out id.p12 -passout pass:x
#   security import id.p12 -k login.keychain-db -P x -T /usr/bin/codesign && rm key.pem cert.pem id.p12
set -euo pipefail

app=$1
# Without this string macOS denies AppleScript automation without asking.
plutil -replace NSAppleEventsUsageDescription \
  -string "Coding agents running in Tabula Rasa control other apps when you ask them to." \
  "$app/Contents/Info.plist"
codesign --force --deep --sign "Tabula Rasa Local Signing" "$app"
codesign --verify --deep --strict "$app"
