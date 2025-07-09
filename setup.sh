#!/bin/bash

# Define the home directory variable
HOME_DIR="$(dirname "$(readlink -f "$0")")"

# Create systemd service file for Reading Tutor App
sudo bash -c 'cat <<EOF > /etc/systemd/system/reading-tutor.service
[Unit]
Description=Reading Tutor App
After=network.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$HOME_DIR
ExecStart=$HOME_DIR/start.sh
ExecStop=/usr/bin/docker compose down

[Install]
WantedBy=multi-user.target
EOF'

# Set permission for start.sh to make it executable
chmod +x $HOME_DIR/start.sh

# Reload systemd to apply the new service
sudo systemctl daemon-reload
sudo systemctl enable reading-tutor
sudo systemctl start reading-tutor

echo "Reading Tutor app setup complete. It will start automatically on boot."
