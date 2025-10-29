import React from 'react';

const App: React.FC = () => {
    return (
        <div className="app">
            <h1>Nextcloud Deck</h1>
            <iframe
                src="https://cloud.deinedomain.de/apps/deck"
                title="Nextcloud Deck"
                style={{ width: '100%', height: '100vh', border: 'none' }}
            />
        </div>
    );
};

export default App;