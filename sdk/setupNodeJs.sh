#!/bin/bash

sudo apt update
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
su $USER
nvm install --lts