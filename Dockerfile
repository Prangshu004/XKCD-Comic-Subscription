# Use Node.js 18 LTS
FROM node:18-alpine

WORKDIR /app

# Copy backend dependencies
COPY backend/package*.json ./
RUN npm install --production

# Copy backend source
COPY backend/ ./

# Copy client and build frontend
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
RUN npm run build

# Move built frontend to backend's static folder
RUN mkdir -p /app/backend/client/dist && cp -r dist/* /app/backend/client/dist/

# Set environment and go back
WORKDIR /app
ENV NODE_ENV=production

# Expose Railway's port
EXPOSE 8080

# Start the backend
CMD ["node", "server.js"]
