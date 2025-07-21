# Stage 1: Build the application
FROM node:24-alpine3.21 AS builder

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

RUN npm run build

# Stage 2: Run the application
FROM node:24-alpine3.21

WORKDIR /app

COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/package-lock.json /app/package-lock.json
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/next-env.d.ts ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/.prettierrc ./
COPY --from=builder /app/.eslintrc.json ./
COPY --from=builder /app/models ./models
COPY --from=builder /app/components ./components
COPY --from=builder /app/public ./public
COPY --from=builder /app/pages ./pages
COPY --from=builder /app/services ./services
COPY --from=builder /app/.next /app/.next

CMD ["npm", "start"]
