#!/bin/bash
# Script: restore_letsencrypt.sh
# Desc: Restores Let's Encrypt to remote

REMOTE_USER="root"
REMOTE_HOST="your_remote_ip"
ZIP_FILE="/tmp/letsencrypt_backup/letsencrypt_backup_YYYYMMDD.zip"

scp "$ZIP_FILE" "$REMOTE_USER@$REMOTE_HOST:/tmp/"
ssh "$REMOTE_USER@$REMOTE_HOST" "unzip -o /tmp/$(basename "$ZIP_FILE") -d /etc/letsencrypt/ && systemctl restart apache2"

echo "Restored Let's Encrypt configs to $REMOTE_HOST"