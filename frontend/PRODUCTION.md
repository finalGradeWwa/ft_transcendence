🇵🇱 Instrukcja: Konfiguracja Produkcyjna (PL)
Po przeniesieniu projektu na serwer (np. Vercel, Netlify, AWS), musisz upewnić się, że frontend potrafi połączyć się z Twoim produkcyjnym API Django.

Nie kopiuj pliku .env.local na serwer: Ten plik służy wyłącznie do pracy lokalnej. Powinien znajdować się w .gitignore.

Ustaw Zmienne Środowiskowe w panelu hostingu:

Zaloguj się do panelu zarządzania swoim serwerem (np. Dashboard Vercel).

Znajdź sekcję Environment Variables (Zmienne środowiskowe).

Dodaj nową zmienną:

Key (Klucz): NEXT_PUBLIC_API_URL

Value (Wartość): https://twoja-domena-backendu.pl (bez ukośnika / na końcu).

Zweryfikuj protokół: Upewnij się, że adres zaczyna się od https. Przeglądarki blokują przesyłanie danych logowania przez zwykłe http w środowisku produkcyjnym.

Przebuduj aplikację (Rebuild): Po dodaniu zmiennej na serwerze, musisz ponownie uruchomić proces budowania (Build), aby Next.js mógł "wszyć" nowy adres do kodu.

🇬🇧 Instructions: Production Setup (EN)
After deploying the project to a server (e.g., Vercel, Netlify, AWS), you must ensure the frontend can connect to your production Django API.

Do not copy .env.local to the server: This file is for local development only. It should remain in .gitignore.

Set Environment Variables in the hosting panel:

Log in to your hosting provider's dashboard (e.g., Vercel Dashboard).

Navigate to the Environment Variables section.

Add a new variable:

Key: NEXT_PUBLIC_API_URL

Value: https://your-backend-domain.com (ensure there is no trailing slash /).

Verify the protocol: Ensure the address starts with https. Browsers block login data transmission over plain http in production environments.

Rebuild the application: After adding the variable on the server, you must trigger a new Build process so Next.js can embed the new address into the production code.

💡 Protip (CORS):
Pamiętaj, że po stronie Backendu (Django) musisz dodać swój produkcyjny adres URL frontendu do listy CORS_ALLOWED_ORIGINS w pliku settings.py, inaczej serwer odrzuci próbę logowania jako nieautoryzowaną.