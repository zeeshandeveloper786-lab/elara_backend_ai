# Step 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Copy source code
COPY . .

# Generate Prisma client and build the app
RUN npx prisma generate
RUN npm run build

# Step 2: Run stage
FROM node:20-alpine

WORKDIR /app

# Copy built assets and necessary files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Expose the application port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["npm", "run", "start:prod"]
