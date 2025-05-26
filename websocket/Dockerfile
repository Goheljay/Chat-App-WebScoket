# Use official Node image
FROM node:18

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package files and install dependencies first (cache optimization)
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Expose the WebSocket port (e.g., 8080)
EXPOSE 4000

# Start the WebSocket server
CMD ["npm", "start"]

