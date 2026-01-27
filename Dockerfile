FROM ghcr.io/puppeteer/puppeteer:latest

# 1. Pindah ke root untuk urusan permission
USER root

WORKDIR /app

# 2. Copy package files
COPY package*.json ./

# 3. Berikan izin folder /app ke pptruser
RUN chown -R pptruser:pptruser /app

# 4. Pindah kembali ke pptruser agar aman
USER pptruser

# 5. Jalankan install (sekarang pptruser punya akses)
RUN npm install

# 6. Copy sisa kode
COPY --chown=pptruser:pptruser . .

# 7. Build & Generate
RUN npx prisma generate
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]