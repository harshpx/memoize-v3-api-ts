# Build stage
FROM oven/bun:1.3.10-slim AS builder
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production

# Runtime stage
FROM oven/bun:1.3.10-distroless AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY src ./src
COPY package.json ./
COPY tsconfig.json ./
EXPOSE 8086
ENTRYPOINT ["bun", "src/index.ts"]