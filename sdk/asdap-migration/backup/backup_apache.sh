#!/bin/bash
# Script: backup_apache.sh
# Desc: Zips Apache config files

BACKUP_DIR="/tmp/apache_backup"
mkdir -p "$BACKUP_DIR"

# Typical Apache config locations
CONFIG_FILES=(
  "/etc/apache2/apache2.conf"
  "/etc/apache2/sites-available/"
  "/etc/apache2/sites-enabled/"
  "/etc/apache2/conf-available/"
  "/etc/apache2/mods-available/"
)

ZIP_NAME="apache_configs_$(date +%Y%m%d).zip"
zip -r "$BACKUP_DIR/$ZIP_NAME" "${CONFIG_FILES[@]}"

echo "Backup created: $BACKUP_DIR/$ZIP_NAME"