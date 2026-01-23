FROM oven/bun:latest

WORKDIR /app

RUN apk add --no-cache curl

COPY package*.json ./

RUN bun install --frozen-lockfile --production

COPY . .

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

CMD ["bun", "run", "start"]

