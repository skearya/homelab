<img width="1322" height="757" alt="image" src="https://github.com/user-attachments/assets/41e123d5-36bf-4f90-8f7f-b2ff43ddd20a" />

## Non-comprehensive setup:
1. Install Docker, just (command runner)
2. `just restore-env` or rename all .env.example files to .env and edit accordingly
3. `just make-folders`
4. `docker compose up -d`
5. Make Pocket ID admin account at https://id.{domain}/setup
6. Create ODIC client for Tinyauth with callback URL: https://auth.{domain}/api/oauth/callback/pocketid
7. Disable ODIC client group restrictions and create signup token to optionally share with people
8. Set Pocket ID background image in UI settings
9. Go to Beszel, add a system with "Host / IP: `/beszel_socket/beszel.sock`" and copy values into beszel/.env for Beszel's agent
10. Setup Beszel discord webhook in settings and enable all alerts
11. Create wg-easy admin account
12. Sanity check every service's health from homepage at https://{domain}
