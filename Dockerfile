# The container of the app. G-Unit Test builds it for each Preview (see README).
FROM node:24-slim
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build
ENV NODE_ENV=production
# `next start` listens on PORT (default 3000).
CMD ["node_modules/.bin/next", "start"]
