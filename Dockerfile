# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# The standalone build bundles mysql2/bcryptjs into its chunks, so the maintenance scripts get their own copy.
FROM base AS scripts-deps
COPY package-lock.json ./
RUN mkdir /scripts-deps && cd /scripts-deps && npm init -y > /dev/null \
 && npm install --omit=dev --no-audit --no-fund $(node -p "const p = require('/app/package-lock.json').packages; ['mysql2', 'bcryptjs', 'dotenv'].map((n) => n + '@' + p['node_modules/' + n].version).join(' ')")

FROM base AS builder
# NEXT_PUBLIC_* values are inlined at build time: declare them as build variables in Coolify.
ARG NEXT_PUBLIC_SITE_URL=https://cubafoussam.cm
ARG NEXT_PUBLIC_GA_ID=
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_GA_ID=$NEXT_PUBLIC_GA_ID \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    TZ=Africa/Douala \
    STORAGE_DIR=/app/storage/uploads

RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/assets ./assets

# Maintenance scripts (create-admin, db:migrate…) run inside the container with `node scripts/…`.
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
COPY --from=scripts-deps --chown=nextjs:nodejs /scripts-deps/node_modules ./scripts/node_modules

# Uploaded images: mount a persistent volume here.
RUN mkdir -p /app/storage/uploads && chown -R nextjs:nodejs /app/storage
# Images committed in storage/uploads, copied into the volume at startup when missing.
COPY --from=builder --chown=nextjs:nodejs /app/storage/uploads ./seed/uploads

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/manifest.webmanifest > /dev/null || exit 1

# -n never overwrites: images edited or replaced from the admin are kept.
CMD ["sh", "-c", "cp -Rn /app/seed/uploads/. \"$STORAGE_DIR\"/ 2>/dev/null || true; exec node server.js"]
