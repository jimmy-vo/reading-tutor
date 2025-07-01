# Use the official Node.js image as the base image
FROM node:20.0.0

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
COPY src/ ./src

# Build the application
RUN npm run build 

# Start the application
CMD ["npm", "start"]
