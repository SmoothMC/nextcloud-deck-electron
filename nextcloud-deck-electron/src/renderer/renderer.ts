// This file contains the renderer process code that interacts with the user interface.

const { ipcRenderer } = require('electron');

// Function to initialize the application
function init() {
    // Example of interacting with the UI
    const titleElement = document.getElementById('app-title');
    titleElement.innerText = 'Nextcloud Deck';
}

// Event listener for when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);