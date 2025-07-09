#!/bin/bash
# Script: restore_var_www.sh
# Desc: Restores /var/www/ backup to remote

REMOTE_USER="root"  # Typically requires root for /var/www/
REMOTE_HOST="your_remote_ip"
ZIP_FILE="/tmp/www_backup/www_backup_YYYYMMDD.zip"  # Replace with actual file

# Copy and unzip on remote
scp "$ZIP_FILE" "$REMOTE_USER@$REMOTE_HOST:/tmp/"
ssh "$REMOTE_USER@$REMOTE_HOST" "unzip -o /tmp/$(basename "$ZIP_FILE") -d /var/www/ && chown -R www-data:www-data /var/www/*"

echo "Restored files to $REMOTE_HOST:/var/www/"