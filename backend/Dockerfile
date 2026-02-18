FROM node:20

WORKDIR /app

RUN apt-get update && apt-get install -y build-essential python3

COPY package*.json ./
RUN rm -rf node_modules && npm install

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start:prod"]
