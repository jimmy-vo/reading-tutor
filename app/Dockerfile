# Use the official Node.js image as the base image
FROM node:24-alpine3.21

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json package-lock.json /app/


# Install dependencies
RUN npm install 

COPY next-env.d.ts ./
COPY tsconfig.json ./
COPY .prettierrc ./
COPY .eslintrc.json ./

# Copy the rest of the application code to the working directory
COPY models/ ./models
COPY components/ ./components
COPY public/ ./public
COPY pages/ ./pages
COPY services/ ./services
COPY utils/ ./utils

# Build the application
RUN npm run build 

# But this has error: reading-tutor  | sh: next: not found
CMD ["npm", "start"]
