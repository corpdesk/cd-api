# npm install -g npm i ts-node typescript
# sudo rm -f /usr/bin/node
# sudo ln -s /usr/bin/nodejs /usr/bin/node
chmod +x /home/devops/cd-sio/src/app.ts
sudo cp /home/devops/cd-sio/sdk/cd-sio.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl start cd-sio
sudo systemctl enable cd-sio
journalctl -fu cd-sio