#!/bin/bash

# This script signs the macOS application for distribution.

APP_NAME="Nextcloud Deck"
APP_ID="de.yourdomain.nextcloud.deck"
ENTITLEMENTS="build/mac/entitlements.plist"
SIGNING_IDENTITY="Developer ID Application: Your Name (Team ID)"

# Path to the app bundle
APP_PATH="dist/$APP_NAME.app"

# Check if the app exists
if [ ! -d "$APP_PATH" ]; then
  echo "Error: App not found at $APP_PATH"
  exit 1
fi

# Sign the app
codesign --deep --force --verify --verbose --sign "$SIGNING_IDENTITY" --entitlements "$ENTITLEMENTS" "$APP_PATH"

# Verify the signature
codesign --verify --deep --strict "$APP_PATH"

if [ $? -eq 0 ]; then
  echo "Successfully signed $APP_NAME"
else
  echo "Failed to sign $APP_NAME"
  exit 1
fi