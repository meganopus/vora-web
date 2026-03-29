# ── Stage 1: Dependencies ──────────────────────────────────────────────────────
FROM oven/bun:1 AS deps

WORKDIR /app

# Copy lockfiles for better layer caching
COPY package.json bun.lock* package-lock.json* ./
COPY prisma ./prisma/

# Install all dependencies (including dev deps for build)
RUN bun install --frozen-lockfile

# Generate Prisma client
RUN bunx prisma generate


# ── Stage 2: Builder ───────────────────────────────────────────────────────────
FROM oven/bun:1 AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma

COPY . .

# Build the Next.js app
ENV NEXT_TELEMETRY_DISABLED=1
ENV SKIP_ENV_VALIDATION=1
RUN bun run build


# ── Stage 3: Runner ────────────────────────────────────────────────────────────
FROM oven/bun:1-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security (Debian-style commands)
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nextjs

# Create the data directory for SQLite and set ownership
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

# Copy built assets from builder stage
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy prisma schema for runtime migrations
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# SQLite db is stored in /app/data — mount this as a volume in Coolify
# DATABASE_URL should be set to: file:/app/data/prod.db
CMD ["bun", "server.js"]
