FROM node:17

WORKDIR /usr/quacker/
COPY package*.json ./ 

RUN npm install

COPY . . 
RUN npm run build

EXPOSE 8080
EXPOSE 5432

CMD ["node", ".dist/server.js"]