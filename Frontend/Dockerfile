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

# Create a startup script that generates config.js with the API URL
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'API_URL=${API_URL:-http://localhost:3000}' >> /app/start.sh && \
    echo 'echo "// API configuration - Generated at runtime" > /app/dist/frontend/browser/config.js' >> /app/start.sh && \
    echo 'echo "window.API_URL = '\''$API_URL'\'';" >> /app/dist/frontend/browser/config.js' >> /app/start.sh && \
    echo 'exec serve -s dist/frontend/browser -l 4200' >> /app/start.sh && \
    chmod +x /app/start.sh

# Run the startup script
CMD ["/app/start.sh"]
