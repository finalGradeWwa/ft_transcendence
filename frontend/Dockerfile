FROM node:20-alpine AS base

# katalog roboczy wewnątrz kontenera
WORKDIR /app

# kopiujemy pliki manifestu zależności
COPY package.json package-lock.json ./

# instalacja zależności
FROM base AS deps
RUN npm install

# budowanie aplikacji
FROM base AS builder
# kopiujemy zainstalowane zależności i resztę kodu
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# budujemy aplikację Next.js. Ta komenda generuje pliki do katalogu .next
RUN npm run build

# używamy mniejszego obrazu Node.js, aby zminimalizować rozmiar
FROM node:20-alpine AS runner

# ustawiamy zmienne środowiskowe Next.js
ENV NODE_ENV production
ENV PORT 3000

# tworzymy użytkownika i grupę dla bezpieczeństwa
# cel: Podniesienie Bezpieczeństwa (Security Hardening).
# aplikacja Next.js nie będzie uruchamiana jako użytkownik root wewnątrz kontenera.
# nawet jeśli kontener zostanie zaatakowany, złośliwy kod będzie miał tylko ograniczone uprawnienia do plików i systemu,
# 	co drastycznie zmniejsza ryzyko poważnego uszkodzenia serwera hosta
RUN addgroup --system --gid 1001 nextjs
RUN adduser --system --uid 1001 nextjs

# kopiujemy tylko niezbędne pliki z etapu budowania:
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules ./node_modules

# uruchamiamy aplikację jako użytkownik nextjs
USER nextjs
EXPOSE 3000

# Next.js używa komendy `node server.js` do uruchomienia po zbuildowaniu
CMD ["node", "server.js"]
