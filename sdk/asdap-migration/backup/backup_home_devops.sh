#!/bin/bash
# Script: backup_home_devops.sh
# Desc: Zips all marked files in /home/devops/

BACKUP_DIR="/tmp/devops_backup"
mkdir -p "$BACKUP_DIR"

# Files to zip (marked with [*] in your list)
FILES_TO_ZIP=(
  "/home/devops/.bashrc"
  "/home/devops/.htaccess"
  "/home/devops/.npm"
  "/home/devops/.nvm"
  "/home/devops/.ssh"
  "/home/devops/cd-api"
  "/home/devops/cd-sio"
  "/home/devops/config.ts"
  "/home/devops/deploy_cdapi.sh"
  "/home/devops/env_api.txt"
  "/home/devops/env_sio.txt"
  "/home/devops/gitUpdate.sh"
  "/home/devops/install_apps.sh"
  "/home/devops/temp_cd_shell"
  "/home/devops/testNpmStart.sh"
  "/home/devops/updateCdShell_do.sh"
  "/home/devops/updateCdUser_do.sh"
  "/home/devops/updateRemoteApp.sh"
)

# Create zip
ZIP_NAME="devops_home_backup_$(date +%Y%m%d).zip"
zip -r "$BACKUP_DIR/$ZIP_NAME" "${FILES_TO_ZIP[@]}"

echo "Backup created: $BACKUP_DIR/$ZIP_NAME"