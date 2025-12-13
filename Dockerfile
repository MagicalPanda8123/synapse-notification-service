FROM node:20-alpine AS deps
WORKDIR /app

# Install dev dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Generate Prisma Client here
COPY prisma ./prisma
RUN npx prisma generate

# ------------------------------------
# Runtime image — production only deps
# ------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install only production deps into runtime image
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy generated Prisma client (already generated in deps stage)
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=deps /app/node_modules/@prisma ./node_modules/@prisma

# Copy app source
COPY . .

EXPOSE 4001
CMD ["npm", "start"]
