# Use Node.js 18 LTS
FROM node:18-alpine

WORKDIR /app

# Copy and install backend dependencies
COPY backend/package*.json ./
RUN npm install --production

# Copy backend source
COPY backend/ ./

# Copy client source and build frontend
WORKDIR /app/client
COPY client/ ./
RUN npm install
RUN npm run build

# Move built frontend into backend's public folder
RUN mkdir -p /app/backend/client/dist && cp -r dist/* /app/backend/client/dist/

# Set environment and working directory
WORKDIR /app
ENV NODE_ENV=production
EXPOSE 8080

# Start backend
CMD ["node", "server.js"]
