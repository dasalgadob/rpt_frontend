# Use official Node.js LTS image
FROM node:20-alpine as builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install --production=false

# Copy all source code
COPY . .

# Build Next.js app
RUN npm run build

# Production image
FROM node:20-alpine as runner
WORKDIR /app

ENV NODE_ENV=production

# Copy only necessary files for production
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/.env ./

EXPOSE 3002

CMD ["npm", "start", "--", "-p", "3002"]
