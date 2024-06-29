#!/bin/bash

sudo -u devops chmod +x /home/devops/cd-api/sdk/cd-daemon-config/start_cd_api.sh
sudo -u devops chmod +x /home/devops/cd-sio/sdk/cd-daemon-config/start_cd_sio.sh
sudo rm -f /usr/bin/node
sudo ln -s /usr/bin/nodejs /usr/bin/node
sudo chmod +x /home/devops/cd-api/src/app.ts
sudo chmod +x /home/devops/cd-sio/src/app.ts
sudo cp /home/devops/cd-sio/sdk/cd-daemon-config/cd-api.service /etc/systemd/system/
sudo cp /home/devops/cd-sio/sdk/cd-daemon-config/cd-sio.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl start cd-api
sudo systemctl start cd-sio
sudo systemctl enable cd-api
sudo systemctl enable cd-sio