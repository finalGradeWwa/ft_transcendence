# PL: Etap bazowy: Definicja lekkiego obrazu Node.js i katalogu roboczego.
# EN: Base stage: Defining a lightweight Node.js image and working directory.
FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./

# PL: Etap zależności: Instalacja pakietów niezbędnych do budowania.
# EN: Dependencies stage: Installing packages required for building.
FROM base AS deps
RUN npm install

# PL: Etap budowania: Kompilacja aplikacji Next.js do wersji produkcyjnej.
# EN: Builder stage: Compiling the Next.js application for production.
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# PL: Etap końcowy (Runner): Minimalistyczny obraz produkcyjny zoptymalizowany pod kątem bezpieczeństwa.
# EN: Final stage (Runner): Minimalist production image optimized for security.
FROM node:20-alpine AS runner

# PL: Konfiguracja zmiennych środowiskowych dla środowiska produkcyjnego.
# EN: Environment variable configuration for the production environment.
ENV NODE_ENV production
ENV PORT 3000

# PL: Utworzenie użytkownika systemowego w celu uniknięcia uruchamiania procesu jako root.
# EN: Creating a system user to avoid running the process as root.
RUN addgroup --system --gid 1001 nextjs
RUN adduser --system --uid 1001 nextjs

# PL: Kopiowanie wyłącznie artefaktów niezbędnych do działania aplikacji (output: standalone).
# EN: Copying only the artifacts necessary for the application to run (output: standalone).
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules ./node_modules

# PL: Zmiana uprawnień i wystawienie portu.
# EN: Changing permissions and exposing the port.
USER nextjs
EXPOSE 3000

# PL: Uruchomienie zoptymalizowanego serwera Node.js.
# EN: Starting the optimized Node.js server.
CMD ["node", "server.js"]