#!/bin/bash
# Script: restore_home_devops.sh
# Desc: Restores the zip to a remote machine via SSH

REMOTE_USER="devops"
REMOTE_HOST="your_remote_ip"
ZIP_FILE="/tmp/devops_backup/devops_home_backup_YYYYMMDD.zip"  # Replace with actual file

# Copy and unzip on remote
scp "$ZIP_FILE" "$REMOTE_USER@$REMOTE_HOST:/tmp/"
ssh "$REMOTE_USER@$REMOTE_HOST" "unzip -o /tmp/$(basename "$ZIP_FILE") -d /home/devops/"

echo "Restored files to $REMOTE_HOST:/home/devops/"
