FROM node:20-alpine

RUN mkdir /app

WORKDIR /app

COPY  * /app

RUN npm i
RUN npm run tsc
CMD ["node", "/app/dist/index.js"]
