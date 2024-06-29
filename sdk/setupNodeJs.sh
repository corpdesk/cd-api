#!/bin/bash


nodeVersion="v16.20.2"
cd ~
sudo apt install curl
curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
nvm install $nodeVersion