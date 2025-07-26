# Stage 1: Build the application
FROM node:24.4.1-bookworm-slim AS builder

WORKDIR /app

COPY package.json package-lock.json /app/


RUN npm install

COPY next-env.d.ts ./
COPY tsconfig.json ./
COPY .prettierrc ./
COPY .eslintrc.json ./

COPY models/ ./models
COPY components/ ./components
COPY public/ ./public
COPY pages/ ./pages
COPY services/ ./services
COPY context/ ./context
COPY helper/ ./helper

RUN npm run build

# Stage 2: Run the application
FROM node:24.4.1-bookworm-slim

WORKDIR /app

COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/next-env.d.ts ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/services ./services
COPY --from=builder /app/.next /app/.next

CMD ["npm", "start"]
