## Setting Up the App to Run on Boot

To ensure the app runs when the Raspberry Pi boots up, we will use systemd to manage the Docker Compose service.

1. Create a systemd service file:

   ```bash
   sudo nano /etc/systemd/system/reading-tutor.service
   ```

2. Add the following content to the service file:

   ```
   [Unit]
   Description=Reading Tutor App
   After=network.target

   [Service]
   Type=oneshot
   RemainAfterExit=yes
   WorkingDirectory=/home/will/reading-tutor
   ExecStart=/usr/bin/docker compose up --build -d reading-tutor
   ExecStop=/usr/bin/docker compose down

   [Install]
   WantedBy=multi-user.target
   ```

3. Reload systemd to apply the new service:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable reading-tutor
   sudo systemctl start reading-tutor
   ```

Your Reading Tutor app should now start automatically whenever your Raspberry Pi boots up.
