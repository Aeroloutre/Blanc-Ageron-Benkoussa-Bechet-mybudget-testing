FROM node:20-alpine

WORKDIR /app

COPY package*.json .//

RUN npm i

COPY . .

# Faire gaffe de bien mettre le meme port que le server js ducoup :D
EXPOSE 3000

CMD ["node", "server.js"]
