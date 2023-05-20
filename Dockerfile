# From which image we want to build from. Here we use the latest LTS (long term support) version boron of node available from the Docker Hub:
FROM node:alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD nodemon server.ts
