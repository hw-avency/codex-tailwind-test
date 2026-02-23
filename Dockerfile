FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY package*.json ./
# Keep vite available at runtime for `npm run start` (vite preview).
RUN npm install
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
EXPOSE 8080
CMD ["npm", "run", "start"]
