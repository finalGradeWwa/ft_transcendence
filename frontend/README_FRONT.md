# 🚀 Jak otworzyć stronę po ściągnięciu repozytorium?
## Klonowanie repozytorium
	git clone <adres_repozytorium>
		cd <nazwa_projektu>

## Uruchamianie jedną komendą (od podstaw):
	docker compose up -d --build

## Wznowienie działania już utworzonych i zatrzymanych kontenerów"
	docker compose start

## Zatrzymanie dockera
	docker compose stop

## Zatrzymanie i usunięcie zasobów (bez woluminóœ):
	docker compose down

## Zatrzymanie i usunięcie zasobów (z woluminami):
	docker compose down -v

# ------------------------------------------------

## Szybkie uruchamianie bez konteneryzacji:
	Projekt używa node_modules i pliku package.json, więc do instalacji potrzebne jest środowisko Node.js i npm
		npm install

	Uruchom skrypt startowy:
		npm run dev

	Po uruchomieniu serwera, strona jest dostępna pod adresem:
		http://localhost:3000


# ------------------------------------------------

# 🤔 Sprawdzenie zainstalowanej wersji Chrome w terminalu:
	dpkg --list | grep google

# ------------------------------------------------

# Obraz Alpine (node:20-alpine) 
## - node:20 (wersja Node.js) i -alpine (typ systemu operacyjnego).
	Alpine:
		Bardzo mały (często poniżej 150 MB)
		Zawiera tylko absolutnie niezbędne minimum do działania Node.js.
		Mniejsza powierzchnia ataku (mniej pakietów = mniej luk).
	node:20
		Next.js jest frameworkiem React renderowanym po stronie serwera (SSR), 
		co oznacza, że kod musi być uruchamiany w środowisku Node.js.

# ------------------------------------------------

# Tryb czytania - Reading mode

## 🇵🇱 Instrukcja: Naprawa Czytania w Chrome (Linux)

Jeśli Tryb Czytania "kręci się" w nieskończoność:

Uruchom silnik mowy: Otwórz terminal i wpisz: systemctl --user start speech-dispatcher
Sprawdź, czy system "mówi": Wpisz: spd-say "test"
Zrestartuj Chrome: Zamknij wszystkie okna przeglądarki i otwórz ją ponownie.
Wybierz głos lokalny: W ustawieniach Trybu Czytania (ikona litery A) wybierz głos bez dopisku "Naturalny" (np. Google Polski lub eSpeak).

## 🇬🇧 Instructions: Fix Chrome Reading Mode (Linux)

If the Reading Mode spinner hangs indefinitely:

Start the speech engine: Open terminal and run: systemctl --user start speech-dispatcher
Verify system speech: Type: spd-say "test"
Restart Chrome: Close all browser instances and relaunch.
Select local voice: In Reading Mode settings (the A icon), choose a non-"Natural" voice (e.g., Google English or eSpeak).