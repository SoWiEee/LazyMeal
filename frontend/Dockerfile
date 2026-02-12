FROM oven/bun:1.2.14-alpine

WORKDIR /app/frontend

COPY frontend/package.json ./package.json
RUN bun install

COPY frontend/ .

EXPOSE 5173

CMD ["bun", "run", "dev", "--host", "0.0.0.0", "--port", "5173"]
