#!/bin/bash
# Script: restore_apache.sh
# Desc: Restores Apache configs to remote

REMOTE_USER="root"
REMOTE_HOST="your_remote_ip"
ZIP_FILE="/tmp/apache_backup/apache_configs_YYYYMMDD.zip"

scp "$ZIP_FILE" "$REMOTE_USER@$REMOTE_HOST:/tmp/"
ssh "$REMOTE_USER@$REMOTE_HOST" "unzip -o /tmp/$(basename "$ZIP_FILE") -d /etc/apache2/ && systemctl restart apache2"

echo "Restored Apache configs to $REMOTE_HOST"