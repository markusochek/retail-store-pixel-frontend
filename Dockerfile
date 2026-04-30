FROM node:20-alpine AS base
WORKDIR /app

# Сначала копируем файлы зависимостей и схему Prisma
COPY package*.json ./
COPY prisma ./prisma

# Устанавливаем зависимости
RUN npm ci

# Генерируем Prisma Client (перед сборкой!)
RUN npx prisma generate

# Теперь копируем остальной код и собираем Next.js
COPY . .
ENV NEXT_DISABLE_ESLINT=1
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app

COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
# Если планируете запускать миграции в рантайме, скопируйте prisma
COPY --from=base /app/prisma ./prisma

EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && npm start"]