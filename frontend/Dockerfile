# === Stage 1: Instalar dependencias ===
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json ./
RUN npm install

# === Stage 2: Build de Vite ===
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# === Stage 3: Producción con Nginx ===
FROM nginx:alpine AS runner

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]
