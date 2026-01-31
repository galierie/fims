# syntax=docker/dockerfile:1

FROM node:24.13.0 AS builder

WORKDIR /app

COPY package*.json .
COPY pnpm-lock.yaml .

RUN corepack enable pnpm
RUN pnpm install

COPY . .

RUN pnpm run build
RUN pnpm prune --prod

FROM node:24.13.0 AS deployer

WORKDIR /app

COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY package.json .

EXPOSE 3000


CMD [ "node", "build" ]