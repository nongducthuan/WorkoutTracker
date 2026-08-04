# ==========================================
# Stage 1: Build Stage
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies if needed
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

# Generate Prisma Client & Compile TypeScript
RUN npx prisma generate
RUN npm run build

# ==========================================
# Stage 2: Production Dependencies Stage
# ==========================================
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production
RUN npx prisma generate

# ==========================================
# Stage 3: Final Runner Stage
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

# Install curl for Docker healthcheck
RUN apk add --no-cache curl

ENV NODE_ENV=production
ENV PORT=8080
ENV TZ=Asia/Ho_Chi_Minh

# Copy necessary files from build & deps stages
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8080/health/live || exit 1

CMD ["node", "dist/server.js"]
