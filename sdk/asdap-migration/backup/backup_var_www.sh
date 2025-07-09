#!/bin/bash
# Script: backup_var_www.sh
# Desc: Zips marked directories in /var/www/

BACKUP_DIR="/tmp/www_backup"
mkdir -p "$BACKUP_DIR"

# Directories to zip
WWW_DIRS=(
  "/var/www/asdap.africa"
  "/var/www/cd-comm"
  "/var/www/cd-moduleman"
  "/var/www/cd-user"
  "/var/www/coops"
)

# Create zip
ZIP_NAME="www_backup_$(date +%Y%m%d).zip"
zip -r "$BACKUP_DIR/$ZIP_NAME" "${WWW_DIRS[@]}"

echo "Backup created: $BACKUP_DIR/$ZIP_NAME"