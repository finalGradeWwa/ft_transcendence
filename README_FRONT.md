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

## Stara wersja bez konteneryzacji: Instalacja zależności
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
		