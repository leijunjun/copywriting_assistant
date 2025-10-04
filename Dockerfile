FROM node:20.17.0 as base

FROM base AS deps


WORKDIR /app

COPY package.json  package-lock.json ./

RUN yarn config set registry 'https://registry.npmmirror.com/'
RUN npm install

FROM base AS builder


WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build


EXPOSE 3000


CMD ["npm", "start"]

