FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 5173

# Reinstala dependencias al arrancar por si el bind mount pisa node_modules
CMD ["sh", "-c", "npm install && npm run dev -- --host 0.0.0.0"]
