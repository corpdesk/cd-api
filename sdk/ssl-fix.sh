#!/bin/bash

# Create group with root and devops as members
sudo addgroup nodecert
sudo adduser devops nodecert
sudo adduser root nodecert

# Make the relevant letsencrypt folders owned by said group.
sudo chgrp -R nodecert /etc/letsencrypt/live
sudo chgrp -R nodecert /etc/letsencrypt/archive

# Allow group to open relevant folders
sudo chmod -R 750 /etc/letsencrypt/live
sudo chmod -R 750 /etc/letsencrypt/archive

# below make it work but...can nginx or apache be able to auto-renew the certificate?
sudo chown devops -R /etc/letsencrypt