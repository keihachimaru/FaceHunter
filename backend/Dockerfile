# ─── Build stage ─────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Prune dev dependencies — keeps only production packages
RUN npm prune --omit=dev

# ─── Production stage ────────────────────────────
FROM node:22-alpine

WORKDIR /app

# Copy production node_modules and compiled dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# Copy entrypoint
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/docker-entrypoint.sh"]
