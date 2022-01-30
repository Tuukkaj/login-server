FROM node:17

WORKDIR /home/login-server/
COPY package*.json ./

RUN npm install

COPY . . 
RUN npm run build

EXPOSE 8080

CMD ["node", ".dist/server.js"]