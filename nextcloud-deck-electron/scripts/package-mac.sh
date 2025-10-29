#!/bin/bash

# This script automates the packaging process for the macOS application.

# Set variables
APP_NAME="nextcloud-deck-electron"
BUILD_DIR="./build/mac"
OUTPUT_DIR="./dist"
APP_ID="de.yourdomain.nextcloud.deck"
PRODUCT_NAME="Nextcloud Deck"

# Create output directory if it doesn't exist
mkdir -p $OUTPUT_DIR

# Build the application using electron-builder
npx electron-builder --mac --x64 --config ./package.json

# Move the built application to the output directory
mv "dist/${PRODUCT_NAME}-*.dmg" "$OUTPUT_DIR/"
mv "dist/${PRODUCT_NAME}-*.zip" "$OUTPUT_DIR/"

echo "Packaging complete. The application is located in the $OUTPUT_DIR directory."