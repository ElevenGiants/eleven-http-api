#!/usr/bin/env bash

# deployment script executed on the build host (by Jenkins)

set -xe

src_dir=${WORKSPACE}/eleven-http-api

# check if source directory exists
if [[ ! -d "$src_dir" ]]; then
	echo "source directory not found: $src_dir"
	exit 1
fi

# copy everything over to target host
rsync --compress --recursive --exclude=".git*" -e "ssh -p ${SSH_PORT}" "${src_dir}/" jenkins@${SSH_HOST}:/eleven/eleven-http-api.new

# run remote deployment script (moves old version out of the way, replaces it
# with new one and restarts service)
ssh -T -p ${SSH_PORT} jenkins@${SSH_HOST} /eleven/eleven-http-api.new/deploy/deploy-remote.sh
