FROM node:24

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm ci

COPY . .

CMD [ "npm", "run", "main" ]
