# Dockerfile
FROM node:20-slim

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production

# # If you’re using TS
# COPY tsconfig.json ./
# COPY src ./src
# RUN npm run build      # emits dist/lister.js

# Copy the rest of your app's source code into the directory /app in the container
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

CMD ["node", "dist/index.js"]

EXPOSE 8080