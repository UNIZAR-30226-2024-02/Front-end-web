# Stage 1: Build the Angular app
FROM node:14 AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build -- --output-path=./dist/out

# Stage 2: Serve the Angular app with NGINX
FROM nginx:alpine

COPY --from=builder /app/dist/out /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

