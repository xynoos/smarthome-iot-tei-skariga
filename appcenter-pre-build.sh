#!/usr/bin/env bash

echo "Injecting AppCenter secret..."
echo "{\"app_secret\":\"$APPCENTER_APP_SECRET\"}" > android/app/src/main/assets/appcenter-config.json
