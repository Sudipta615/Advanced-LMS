FROM oven/bun:latest

WORKDIR /app

RUN apk add --no-cache curl

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile --production

COPY . .

# Create startup script that waits for database
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'echo "Waiting for database..."' >> /app/start.sh && \
    echo 'sleep 5' >> /app/start.sh && \
    echo 'exec bun server.js' >> /app/start.sh && \
    chmod +x /app/start.sh

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

CMD ["/app/start.sh"]
