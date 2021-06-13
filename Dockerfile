# To use this image you need a redis database enabled.
# Example:
# 
# $ docker run -p 6379:6379 --name some-redis -d redis
#
# Bare minimum run
# ------------------------------
# $ docker run -p 3000:3000 -d --name=hemmelig \
#   -e SECRET_MASTER_KEY=11111222223333344444555556666677 \ # has to be a secret key of 32 characters
#   -e SECRET_REDIS_HOST=127.0.0.1 \
#   hemmeligapp/hemmelig:latest
#
#
# All available env keys
# ------------------------------
#
# $ docker run -p 3000:3000 -d --name=hemmelig \
#   -e SECRET_HOSTNAME=example.com \
#   -e SECRET_PORT=3000 \
#   -e SECRET_MASTER_KEY=11111222223333344444555556666677 \
#   -e SECRET_REDIS_HOST=the_redis_host_name \
#   -e SECRET_REDIS_PORT=6379 \
#   -e SECRET_REDIS_TLS=true \
#   -e SECRET_REDIS_USER=username \
#   -e SECRET_REDIS_PASSWORD=glhf \
#   hemmeligapp/hemmelig:latest

FROM node:lts-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

ENV NODE_ENV=production

RUN npm run build


# Get ready for step two of the docker image build
FROM node:lts-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --production

RUN mkdir build
COPY --from=0 /usr/src/app/build build/

COPY . .

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "server.js"]