FROM node:lts-alpine3.20

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn

COPY prisma ./prisma/

COPY . .

RUN npx prisma generate