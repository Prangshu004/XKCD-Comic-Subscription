# Use Node.js 18 LTS as the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install backend dependencies
RUN npm install

# Copy backend source code
COPY backend/ .

# Copy client directory
COPY client/ ./client/

# Install frontend dependencies and build the frontend
WORKDIR /app/client
RUN npm install
RUN npm run build

# Go back to backend directory
WORKDIR /app

# Expose the port
EXPOSE $PORT

# Start the application
CMD ["npm", "start"]