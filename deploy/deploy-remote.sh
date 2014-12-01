#!/usr/bin/env bash

# deployment script executed on the remote/target host by deploy.sh (via SSH)

set -xe

rm -rf /eleven/eleven-http-api.old
[[ ! -d /eleven/eleven-http-api ]] || mv /eleven/eleven-http-api /eleven/eleven-http-api.old
mv /eleven/eleven-http-api.new /eleven/eleven-http-api
sudo /bin/systemctl restart eleven-http-api
