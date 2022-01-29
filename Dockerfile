FROM node:17

WORKDIR /home/quacker/
COPY package*.json ./

RUN npm install

COPY . . 
RUN npm run build

ARG NODE_ENV=production

EXPOSE 8080

CMD ["node", ".dist/server.js"]