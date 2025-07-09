#!/bin/bash
# Script: backup_letsencrypt.sh
# Desc: Zips Let's Encrypt files

BACKUP_DIR="/tmp/letsencrypt_backup"
mkdir -p "$BACKUP_DIR"

ZIP_NAME="letsencrypt_backup_$(date +%Y%m%d).zip"
zip -r "$BACKUP_DIR/$ZIP_NAME" "/etc/letsencrypt/"

echo "Backup created: $BACKUP_DIR/$ZIP_NAME"