FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

# Ejecutar con el usuario sin privilegios que trae la imagen oficial de Node.
USER node

EXPOSE 3000

CMD ["node", "src/server.js"]
