FROM node:22-alpine

WORKDIR /app/frontend

COPY frontend/package.json ./package.json
COPY frontend/yarn.lock ./yarn.lock
RUN yarn install --frozen-lockfile

COPY frontend/ .

EXPOSE 5173

CMD ["yarn", "dev", "--host", "0.0.0.0", "--port", "5173"]
