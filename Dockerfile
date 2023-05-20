# From which image we want to build from. Here we use the latest LTS (long term support) version boron of node available from the Docker Hub:
FROM node:alpine

# copy all the files from the project’s root to the working directory (here it is /app)
COPY . /app

WORKDIR /ts
# command to run when the container is started
CMD ts-node server.ts
