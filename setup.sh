#!/bin/bash

# Define the home directory variable
HOME_DIR="${1:-$(pwd)}"
echo "Set up for $HOME_DIR"

sudo systemctl stop reading-tutor
sudo systemctl disable reading-tutor
sudo rm /etc/systemd/system/reading-tutor.service
sudo systemctl daemon-reload

echo " Create systemd service file for Reading Tutor App"

sudo bash -c "cat <<EOF > /etc/systemd/system/reading-tutor.service
[Unit]
Description=Reading Tutor App
After=network.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$HOME_DIR
ExecStartPre=/usr/bin/git pull
ExecStart=/usr/bin/docker compose up --build -d 
ExecStop=/usr/bin/docker compose down

[Install]
WantedBy=multi-user.target
EOF"

# Set permission for start.sh to make it executable
chmod +x $HOME_DIR/start.sh

echo "Reload systemd to apply the new service"
sudo systemctl daemon-reload
sudo systemctl enable reading-tutor
sudo systemctl start reading-tutor

echo "Reading Tutor app setup complete. It will start automatically on boot."
