FROM node:20-bullseye-slim

WORKDIR /app

# 1. Install Dependencies Sistem & Google Chrome untuk Puppeteer
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    ca-certificates \
    --no-install-recommends \
    && curl -fsSL https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-linux-keyring.gpg \
    && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-linux-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" \
       > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# 2. Environment Variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
ENV NODE_ENV=production

# 3. Copy files & Install dependencies
COPY package*.json ./
RUN npm install --frozen-lockfile

# 4. Copy seluruh kode
COPY . .

# 5. Prisma Generate (jika pakai Prisma)
RUN npx prisma generate

# 6. Build Next.js
RUN npm run build

EXPOSE 3000

# 7. Start App
CMD ["npm", "start"]

# # Base image
# FROM node:22-bullseye

# # Set working directory
# WORKDIR /app

# # Environment variable
# # Supaya Puppeteer tidak download Chromium sendiri
# ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# # Install system dependencies + Google Chrome
# RUN apt-get update && apt-get install -y \
#     curl \
#     gnupg \
#     ca-certificates \
#     --no-install-recommends \
#   && curl -fsSL https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-linux-keyring.gpg \
#   && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-linux-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" \
#      > /etc/apt/sources.list.d/google-chrome.list \
#   && apt-get update \
#   && apt-get install -y google-chrome-stable --no-install-recommends \
#   && rm -rf /var/lib/apt/lists/*

# # Copy dependency files
# COPY package*.json ./

# # Install Node.js dependencies
# RUN npm install

# # Copy all source files
# COPY . .

# # Expose application port
# EXPOSE 3000

# # Start application
# # - Generate Prisma client sesuai arsitektur Linux
# # - Build Next.js
# # - Start production server
# CMD npx prisma generate && npm run build && npm start

# # Base image
# # FROM node:22-bullseye

# # WORKDIR /app

# # ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
# # ENV NODE_ENV=production

# # # Install system deps + Chrome
# # RUN apt-get update && apt-get install -y \
# #     curl \
# #     gnupg \
# #     ca-certificates \
# #     --no-install-recommends \
# #   && curl -fsSL https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-linux-keyring.gpg \
# #   && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-linux-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" \
# #      > /etc/apt/sources.list.d/google-chrome.list \
# #   && apt-get update \
# #   && apt-get install -y google-chrome-stable --no-install-recommends \
# #   && rm -rf /var/lib/apt/lists/*

# # # Copy dependency files
# # COPY package*.json ./

# # # Install dependencies (production only)
# # RUN npm install

# # # Copy source
# # COPY . .

# # # Generate Prisma Client (LINUX)
# # RUN npx prisma generate

# # Build Next.js (ONCE, SAAT BUILD IMAGE)
# # RUN npm run build

# # EXPOSE 3000

# # # 🚀 START ONLY (NO BUILD, NO MIGRATE)
# # CMD ["npm", "start"]
