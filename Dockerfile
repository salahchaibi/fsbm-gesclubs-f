FROM node:22-alpine AS build

WORKDIR /app

ARG APP_URL=""
ENV APP_URL=${APP_URL}

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=build /app/dist ./dist
COPY server.js ./server.js

EXPOSE 3000

CMD ["node", "server.js"]
