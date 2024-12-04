FROM node:18-alpine

WORKDIR /app/pixelfoodapi

COPY package*.json ./

RUN npm install stripe

RUN npm install

COPY ./dist ./
COPY .env ./

EXPOSE 5000

CMD ["node","index.js"]
