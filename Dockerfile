# Stage 1: Build TypeScript app
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source files and build
COPY . .
RUN npm run build

# Stage 2: Run the built app
FROM node:18-alpine

WORKDIR /app

# Copy only built output and production deps
COPY --from=builder /app/dist ./
COPY package*.json ./
RUN npm ci --omit=dev

# Expose the port your Express app listens on
EXPOSE 9339

# Start the app
CMD ["node", "index.js"]
