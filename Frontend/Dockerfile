FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the Angular app for production
RUN npm run build

# Install a simple static file server
RUN npm install -g serve

# Expose port 4200
EXPOSE 4200

# Serve the built app
CMD ["serve", "-s", "dist/frontend/browser", "-l", "4200"]
