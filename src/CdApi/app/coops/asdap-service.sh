cd /home/devops/cd-sio/
npm install npm i ts-node typescript
cd /home/devops/cd-api/
npm install npm i ts-node typescript
chmod +x /home/devops/cd-api/src/app.ts
chmod +x /home/devops/cd-sio/src/app.ts
sudo cp /home/devops/cd-api/src/CdApi/app/coops/asdap.service /etc/systemd/system/
sudo cp /home/devops/cd-api/src/CdApi/app/coops/asdap.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl start asdap
sudo systemctl start asdap-sio
sudo systemctl enable asdap
sudo systemctl enable asdap-sio



