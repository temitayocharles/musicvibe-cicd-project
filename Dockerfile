# Multi-stage build for MusicVibe (Fastify API + React frontend)
FROM node:20-alpine as builder

WORKDIR /app

# Copy root package files (if root workspace exists) or API package
COPY apps/api/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY apps/api/src ./src
COPY apps/api/tsconfig.json ./

# Build API
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install production dependencies only
COPY apps/api/package*.json ./
RUN npm ci --only=production

# Copy compiled API from builder
COPY --from=builder /app/dist ./dist

# Copy public assets (built frontend)
COPY apps/api/src/public ./dist/public

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Run production server
EXPOSE 4000
CMD ["node", "dist/index.js"]
