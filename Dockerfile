FROM node:20-alpine

RUN mkdir /app

WORKDIR /app

COPY src /app/src
COPY package.json /app
COPY .env /app
COPY tsconfig.json /app

RUN npm i
RUN npx tsc
CMD ["node", "/app/dist/index.js"]
