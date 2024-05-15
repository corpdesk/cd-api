npm install npm i ts-node typescript
chmod +x /home/devops/cd-api/src/app.ts
sudo cp /home/devops/cd-api/sdk/asdap.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl start asdap
sudo systemctl enable asdap

