# Define the base image
FROM node:lts-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json
COPY package*.json ./

# Install dependencies (build stage)
RUN npm install

# Copy your application code
COPY ./src .

# Define a slim runtime image
FROM node:lts-alpine AS runner

# Set working directory
WORKDIR /app

# Copy production dependencies only (optional)
COPY --from=builder /app/node_modules /app/node_modules

# Copy your application code
COPY --from=builder . .

# Expose port (adjust if your app listens on a different port)
EXPOSE 5000

# Start the command defined in package.json (usually "npm start")
CMD [ "npm", "start" ]