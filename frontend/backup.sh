#!/bin/bash

# Skrypt do tworzenia minimalnej kopii zapasowej, zgodnej z plikami GitHuba

# 1. Definicja nazwy archiwum w wymaganym formacie
# Format: 2025-12-13_15-18_transcendence.tar
ARCHIVE_NAME="$(date +%Y-%m-%d_%H-%M)_transcendence_frontend.tar"

# 2. Tworzenie tymczasowego pliku z wykluczeniami
TEMP_EXCLUDE_FILE=".temp_tar_exclude"

# Wykorzystujemy grep, aby przenieść wzorce z .gitignore, usuwając komentarze i puste linie
grep -v '^\s*#\|^\s*$' .gitignore > "$TEMP_EXCLUDE_FILE"

# 3. DODANIE JAWNYCH, DUŻYCH KATALOGÓW DO WYKLUCZEŃ
# Te katalogi muszą być wykluczone, aby zredukować rozmiar z 60MB do kilku MB.

cat >> "$TEMP_EXCLUDE_FILE" <<- EOM
.git
$ARCHIVE_NAME
# Wzorce z .gitignore, ktore musza byc jawnie wykluczone (i moga miec zly format dla tar)
node_modules
.next
out
.pnp
.yarn
coverage
build
.vercel
.docker
.compose
EOM

# 4. Tworzenie archiwum
# Uzywamy --exclude-from, aby odczytac wszystkie wzorce z listy.
echo "Tworzenie minimalnej kopii zapasowej: $ARCHIVE_NAME"
tar --exclude-from="$TEMP_EXCLUDE_FILE" -cf "$ARCHIVE_NAME" ./

# 5. Czyszczenie
rm "$TEMP_EXCLUDE_FILE"

echo "Kopia zapasowa gotowa."