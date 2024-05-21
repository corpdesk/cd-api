# npm install -g npm i ts-node typescript
# sudo rm -f /usr/bin/node
# sudo ln -s /usr/bin/nodejs /usr/bin/node
chmod +x /home/devops/cd-api/src/app.ts
sudo cp /home/devops/cd-api/sdk/cd-api.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl start cd-api
sudo systemctl enable cd-api
journalctl -fu cd-api