ARG NODE_VERSION=22.14.0
FROM node:${NODE_VERSION}-alpine

# 1. Set working directory
WORKDIR /app

# 2. Combine dependency installation and permission setup into one layer
# We use the built-in 'node' user instead of creating 'appuser'
COPY package*.json ./

RUN mkdir -p /app/uploads && \
    chown -R node:node /app && \
    npm install --omit=dev --no-optional --no-audit --no-fund

# 3. Copy source code and ensure ownership in one step
# Using --chown prevents a separate 'chown' layer after copying
COPY --chown=node:node . .

# 4. Use the pre-existing 'node' user
USER node

ENV NODE_ENV=production
EXPOSE 5000

CMD ["npm", "start"]