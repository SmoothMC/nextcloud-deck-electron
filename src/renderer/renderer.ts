// This file contains the renderer process code that interacts with the user interface.

// Function to initialize the application
function init() {
    const titleElement = document.getElementById('app-title');

    if (titleElement) {
        titleElement.textContent = 'Nextcloud Deck';
    }
}

// Event listener for when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);