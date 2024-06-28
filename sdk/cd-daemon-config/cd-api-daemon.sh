# npm install -g npm i ts-node typescript
# sudo -u devops chmod +x /home/devops/cd-api/cd-daemon-config/start_cd_api.sh
# sudo rm -f /usr/bin/node
# sudo ln -s /usr/bin/nodejs /usr/bin/node
# chmod +x /home/devops/cd-api/src/app.ts
# sudo cp /home/devops/cd-api/sdk/cd-daemon-config/cd-api.service /etc/systemd/system/
# sudo systemctl daemon-reload
# sudo systemctl start cd-api
# sudo systemctl enable cd-api
# journalctl -fu cd-api


# sudo -H -u emp-12 bash -c 'cd ~/cd-projects/cd-api && /home/emp-12/.nvm/versions/node/v16.20.1/bin/npm start'
sudo -H -u devops bash -c 'cd ~/cd-api && ~/.nvm/versions/node/v16.20.1/bin/npm start'