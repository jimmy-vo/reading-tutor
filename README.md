## Setting Up the App to Run on Boot

To ensure the app runs when the Raspberry Pi boots up, we will use systemd to manage the Docker Compose service.

1. Run the setup script to configure the Reading Tutor App to run automatically on boot:
   ```bash
   ./setup.sh
   ```
   The `setup.sh` script performs the following actions:
   - Defines the home directory variable.
   - Creates a systemd service file for the Reading Tutor App.
   - Sets permission for `start.sh` to make it executable.
   - Reloads systemd to apply the new service.
   - Enables and starts the `reading-tutor` service.
   - Prints a completion message indicating that the setup is complete and the app will start automatically on boot.
