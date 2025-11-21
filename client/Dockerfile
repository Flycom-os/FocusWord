# Используем официальный Node.js
FROM node:20-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и lock-файл
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --legacy-peer-deps

# Копируем весь проект
COPY . .

# Строим приложение
RUN npm run build

# Экспонируем порт Next.js
EXPOSE 3000

# Команда запуска (production)
CMD ["npm", "run", "start"]
