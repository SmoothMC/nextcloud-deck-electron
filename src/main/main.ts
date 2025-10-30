import { app, BrowserWindow, ipcMain, Menu, type MenuItemConstructorOptions } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Typen -------------------------------------------------------------------
type Preferences = {
  baseDomain?: string;
};

// --- Electron Store ----------------------------------------------------------
let Store: any;
let store: {
  get(key: keyof Preferences): Preferences[keyof Preferences];
  set(key: keyof Preferences, value: Preferences[keyof Preferences]): void;
  path: string;
} | null = null;

async function initStore() {
  if (!Store) {
    const module = await import('electron-store');
    Store = module.default;
  }

  store = new Store({
    name: 'preferences',
    cwd: app.getPath('userData'), // ✅ persistenter Pfad ~/Library/Application Support/Nextcloud Deck/
  }) as {
    get(key: keyof Preferences): Preferences[keyof Preferences];
    set(key: keyof Preferences, value: Preferences[keyof Preferences]): void;
    path: string;
  };

  console.log('[Store initialized]', (store as any).path);
}

// --- Fenster Referenzen ------------------------------------------------------
let mainWindow: BrowserWindow | null = null;
let settingsWindow: BrowserWindow | null = null;

const settingsPagePath = path.join(__dirname, '../renderer/index.html');

// --- Hilfsfunktionen ---------------------------------------------------------
function normalizeBaseDomain(domain: string): string {
  const trimmed = domain.trim();
  if (!trimmed) throw new Error('Domain must not be empty');
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

// --- Menü --------------------------------------------------------------------
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
                nodeIntegration: false,
                sandbox: false,
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
      submenu: [
        { role: 'reload', label: 'Neu laden' },
        { role: 'toggleDevTools', label: 'Entwicklertools umschalten' },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// --- Hauptfenster ------------------------------------------------------------
async function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const savedDomain = store?.get('baseDomain');
  console.log('[Store] loaded domain:', savedDomain);

  if (savedDomain) {
    loadDeckInstance(mainWindow, savedDomain);
  } else {
    loadSettingsPage(mainWindow);
  }
}

// --- IPC Handler -------------------------------------------------------------
ipcMain.handle('get-domain', (event) => {
  const senderUrl = event.senderFrame.url;
  if (!senderUrl.startsWith('file://')) return undefined;
  const value = store?.get('baseDomain');
  console.log('[IPC] get-domain ->', value);
  return value;
});

ipcMain.handle('set-domain', (event, domain: string) => {
  const senderUrl = event.senderFrame.url;
  console.log('[IPC] set-domain triggered', senderUrl, domain);

  if (!senderUrl.startsWith('file://')) {
    console.warn('[IPC] Ignored non-local set-domain request');
    return;
  }

  try {
    const normalizedDomain = normalizeBaseDomain(domain);
    store?.set('baseDomain', normalizedDomain);
    console.log('[Store] Saved baseDomain:', store?.get('baseDomain'));

    if (mainWindow) loadDeckInstance(mainWindow, normalizedDomain);
    if (settingsWindow) {
      settingsWindow.close();
      settingsWindow = null;
    }
  } catch (error) {
    console.error('[Error] Failed to store domain', error);
    throw error instanceof Error ? error : new Error('Failed to store domain');
  }
});

// --- App Lifecycle -----------------------------------------------------------
app.whenReady().then(async () => {
  try {
    await initStore();
    await createMainWindow();
    applyApplicationMenu();
  } catch (error) {
    console.error('[App Error]', error);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
});
