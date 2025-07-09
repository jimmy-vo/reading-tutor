#!/bin/bash

# Pull the latest code from the repository
git pull

# Start the Docker Compose service
/usr/bin/docker compose up --build -d reading-tutor
