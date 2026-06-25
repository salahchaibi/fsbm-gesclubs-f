FROM node:22-alpine AS build

WORKDIR /app

ARG BACKEND_URL=""
ENV BACKEND_URL=${BACKEND_URL}

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
