# nextcloud-deck-electron

Standalone macOS app for Nextcloud Deck.

## Installation

To get started with the Nextcloud Deck Electron app, clone the repository and install the dependencies:

```bash
git clone https://github.com/yourusername/nextcloud-deck-electron.git
cd nextcloud-deck-electron
npm install
```

## Development

To start the application in development mode, run:

```bash
npm start
```

This will launch the Electron application, displaying your Nextcloud Deck instance at `https://cloud.deinedomain.de/apps/deck`.

## Building

To build the application for macOS, use the following command:

```bash
npm run build
```

This will create a packaged application in the `dist` directory.

## Configuration

Configuration settings can be found in `src/config/default.json`. Modify this file to adjust settings as needed.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.