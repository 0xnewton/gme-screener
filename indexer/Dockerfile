# Dockerfile
FROM node:20-slim

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production

# # If you’re using TS
# COPY tsconfig.json ./
# COPY src ./src
# RUN npm run build      # emits dist/lister.js

# Otherwise, just copy your compiled code
COPY dist ./dist

ENV SOLANA_RPC_URL=""  # override at deploy time
CMD ["node", "dist/index.js"]
