# nextcloud-deck-electron

## Overview
This project is a standalone macOS application for Nextcloud Deck, designed to provide a seamless experience for managing tasks and projects directly from your desktop.

## Features
- Displays a specified Nextcloud Deck instance.
- Built using Electron for cross-platform compatibility.
- Customizable and extendable with TypeScript.

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/nextcloud-deck-electron.git
   cd nextcloud-deck-electron
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on the `.env.example` file to configure your environment variables.

## Usage

To start the application in development mode, run:
```
npm start
```

## Build

To build the application for production, run:
```
npm run build
```

This will create a standalone macOS app in the `dist` directory.

## Configuration

The application can be configured through the `.env` file. Make sure to set the necessary environment variables as outlined in the `.env.example` file.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.