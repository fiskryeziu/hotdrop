# Use Node.js LTS
FROM node:lts

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source
COPY . .

# Expose port
EXPOSE 3000

# Start the server
CMD ["npm", "run", "dev"]
