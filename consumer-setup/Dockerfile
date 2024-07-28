# Dockerfile
FROM node:14

# Install FFmpeg
RUN apt-get update && apt-get install -y ffmpeg


WORKDIR /app

# Copy package.json and package-lock.json from the build context
COPY package.json .


# Install dependencies
RUN npm install

# Copy the consumer.js file into /app
COPY consumer.js .

# Command to run the consumer
CMD ["node", "consumer.js"]
