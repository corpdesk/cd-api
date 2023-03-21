#!/bin/bash

cdir=$(pwd)
# set config file
cp "$cdir/migration_template_files/config_sample.ts" ../src/config.ts
cp "$cdir/migration_template_files/env_sample" ../.env

