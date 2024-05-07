# Stage 1: Build the Angular app
FROM node:latest

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install
RUN npm install -g @angular/cli


COPY . .

EXPOSE 4200

CMD ["ng", "serve", "--host", "0.0.0.0"]
