FROM node:8-alpine

WORKDIR /usr/src/app

ADD ./app/package.json ./app/yarn.lock /usr/src/app/

RUN yarn install --production && yarn cache clean

ADD ./app /usr/src/app/

CMD [ "node", "index.js" ]
