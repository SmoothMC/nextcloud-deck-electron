import { app, BrowserWindow, ipcMain, Menu, type MenuItemConstructorOptions } from 'electron';
import path from 'path';
import Store from 'electron-store';

type Preferences = {
    baseDomain?: string;
};

const store = new Store<Preferences>({ name: 'preferences' });

let mainWindow: BrowserWindow | null = null;
let settingsWindow: BrowserWindow | null = null;

const settingsPagePath = path.join(__dirname, '../renderer/index.html');

function normalizeBaseDomain(domain: string): string {
    const trimmed = domain.trim();
    if (!trimmed) {
        throw new Error('Domain must not be empty');
    }

    const hasProtocol = /^https?:\/\//i.test(trimmed);
    return (hasProtocol ? trimmed : `https://${trimmed}`).replace(/\/+$/, '');
}

function buildDeckUrl(domain: string): string {
    const normalizedBase = normalizeBaseDomain(domain);

    return `${normalizedBase}/apps/deck`;
}

function loadDeckInstance(window: BrowserWindow, domain: string) {
    window.loadURL(buildDeckUrl(domain));
}

function loadSettingsPage(targetWindow: BrowserWindow) {
    targetWindow.loadFile(settingsPagePath);
}

function applyApplicationMenu() {
    const template: MenuItemConstructorOptions[] = [
        {
            label: app.name,
            submenu: [
                {
                    label: 'Einstellungen',
                    click: () => {
                        if (settingsWindow) {
                            settingsWindow.focus();
                            return;
                        }

                        settingsWindow = new BrowserWindow({
                            width: 420,
                            height: 360,
                            parent: mainWindow ?? undefined,
                            modal: Boolean(mainWindow),
                            resizable: false,
                            webPreferences: {
                                preload: path.join(__dirname, 'preload.js'),
                                contextIsolation: true,
                                enableRemoteModule: false,
                            },
                        });

                        settingsWindow.on('closed', () => {
                            settingsWindow = null;
                        });

                        loadSettingsPage(settingsWindow);
                    },
                },
                { type: 'separator' },
                { role: 'quit', label: 'Beenden' },
            ],
        },
        {
            label: 'Bearbeiten',
            submenu: [
                { role: 'undo', label: 'Rückgängig' },
                { role: 'redo', label: 'Wiederholen' },
                { type: 'separator' },
                { role: 'cut', label: 'Ausschneiden' },
                { role: 'copy', label: 'Kopieren' },
                { role: 'paste', label: 'Einfügen' },
                { role: 'selectAll', label: 'Alles auswählen' },
            ],
        },
        {
            label: 'Ansicht',
            submenu: [{ role: 'reload', label: 'Neu laden' }, { role: 'toggledevtools', label: 'Entwicklertools umschalten' }],
        },
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
        },
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    const savedDomain = store.get('baseDomain');
    if (savedDomain) {
        loadDeckInstance(mainWindow, savedDomain);
    } else {
        loadSettingsPage(mainWindow);
    }
}

ipcMain.handle('get-domain', (event) => {
    const senderUrl = event.senderFrame.url;
    if (!senderUrl.startsWith('file://')) {
        return undefined;
    }

    return store.get('baseDomain');
});

ipcMain.handle('set-domain', (event, domain: string) => {
    const senderUrl = event.senderFrame.url;
    if (!senderUrl.startsWith('file://')) {
        return;
    }

    try {
        const normalizedDomain = normalizeBaseDomain(domain);

        store.set('baseDomain', normalizedDomain);

        if (mainWindow) {
            loadDeckInstance(mainWindow, normalizedDomain);
        }

        if (settingsWindow) {
            settingsWindow.close();
            settingsWindow = null;
        }
    } catch (error) {
        console.error('Failed to store domain', error);
        throw error instanceof Error ? error : new Error('Failed to store domain');
    }
});

app.whenReady().then(() => {
    createMainWindow();
    applyApplicationMenu();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
    }
});