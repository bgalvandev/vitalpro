FROM node:22-alpine

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml nx.json tsconfig.base.json tsconfig.json .nvmrc ./
COPY apps ./apps
COPY libs ./libs
COPY contracts ./contracts

RUN pnpm install --frozen-lockfile

EXPOSE 3000

CMD ["node", "-r", "@swc-node/register", "apps/core-api/src/main.ts"]
