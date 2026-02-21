# ---- Build stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# ---- Production stage ----
FROM node:20-alpine AS runner

# Security: don't run as root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    # Strip file capabilities from node so no-new-privileges doesn't block exec
    apk add --no-cache libcap && \
    setcap -r /usr/local/bin/node 2>/dev/null || true && \
    apk del --purge libcap

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3002
ENV HOSTNAME="0.0.0.0"

# Copy only the standalone output + static/public assets
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

EXPOSE 3002

# Bypass the default docker-entrypoint.sh (blocked by no-new-privileges)
ENTRYPOINT []
CMD ["node", "server.js"]
