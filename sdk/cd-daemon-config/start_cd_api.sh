#!/bin/bash

export NVM_DIR="/home/devops/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # Load NVM

# Determine the latest Node.js version managed by NVM
NODE_VERSION=$(nvm version default | tr -d 'v')

# Construct the correct path
NODE_BIN="$NVM_DIR/versions/node/v$NODE_VERSION/bin/npm"

if [ -x "$NODE_BIN" ]; then
    echo "🚀 Running npm start with Node.js version: $NODE_VERSION"
    cd /home/devops/cd-api
    exec $NODE_BIN start
else
    echo "❌ Error: Unable to determine the correct Node.js version."
    exit 1
fi
