
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
    WorkingDirectory=/home/pi/reading-tutor
    ExecStart=/usr/local/bin/docker-compose up --build -d
    ExecStop=/usr/local/bin/docker-compose down

    [Install]
    WantedBy=multi-user.target
    ```

3. Reload systemd to apply the new service:
    ```bash
    sudo systemctl daemon-reload
    ```

4. Enable the service to start on boot:
    ```bash
    sudo systemctl enable reading-tutor
    ```

5. You can start the service immediately with:
    ```bash
    sudo systemctl start reading-tutor
    ```

Your Reading Tutor app should now start automatically whenever your Raspberry Pi boots up.
