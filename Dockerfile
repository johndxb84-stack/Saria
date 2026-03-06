# ─────────────────────────────────────────────
# Stage 1: Build React frontend
# ─────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./

# VITE_API_URL is injected at build time by the CI workflow
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ─────────────────────────────────────────────
# Stage 2: Compile backend TypeScript
# ─────────────────────────────────────────────
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

# ─────────────────────────────────────────────
# Stage 3: Lean production image
# ─────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Production dependencies only
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

# Compiled backend
COPY --from=backend-builder /app/backend/dist ./backend/dist

# Built frontend — served as static files by Express
# index.ts resolves this as: path.join(__dirname, '../../frontend/dist')
# __dirname = /app/backend/dist  →  ../../frontend/dist = /app/frontend/dist  ✓
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

EXPOSE 5000
ENV NODE_ENV=production

CMD ["node", "backend/dist/index.js"]
