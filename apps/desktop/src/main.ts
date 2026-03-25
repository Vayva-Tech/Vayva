import { app, BrowserWindow, ipcMain, dialog, shell, Menu } from 'electron';
import * as path from 'path';
import Store from 'electron-store';
import { Database } from './db/database';

// Initialize store for app settings
const _store = new Store();

// Initialize database
let db: Database;

let mainWindow: BrowserWindow | null = null;

// Development mode flag
const isDev = process.env.NODE_ENV === 'development';

function createWindow(): void {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
    icon: path.join(__dirname, '../public/icon.png'),
    titleBarStyle: 'default',
    show: false,
  });

  // Load the app
  if (isDev) {
    // Development: load from dev server
    mainWindow.loadURL('http://localhost:3001');
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    // Production: load built files
    const rendererPath = path.join(__dirname, '../../merchant/out');
    mainWindow.loadFile(path.join(rendererPath, 'index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Create application menu
  createMenu();
}

function createMenu(): void {
  const template: unknown[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Export Data',
          click: async () => {
            if (!mainWindow) return;
            
            const result = await dialog.showSaveDialog(mainWindow, {
              title: 'Export Data',
              defaultPath: app.getPath('downloads') + '/vayva-export.json',
              filters: [{ name: 'JSON', extensions: ['json'] }],
            });

            if (!result.canceled && result.filePath) {
              // Send export event to renderer
              mainWindow.webContents.send('export-data', result.filePath);
            }
          },
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Alt+F4',
          click: () => app.quit(),
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { label: 'Select All', accelerator: 'CmdOrCtrl+A', role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: 'Toggle Full Screen', accelerator: 'F11', role: 'togglefullscreen' },
        ...(isDev ? [
          { label: 'Toggle Developer Tools', accelerator: 'F12', role: 'toggleDevTools' },
        ] : []),
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Vayva',
          click: () => {
            dialog.showMessageBox({
              type: 'info',
              title: 'Vayva Desktop',
              message: `Vayva Desktop Application`,
              detail: `Version: ${app.getVersion()}\n© ${new Date().getFullYear()} Vayva. All rights reserved.`,
            });
          },
        },
        {
          label: 'Documentation',
          click: () => {
            shell.openExternal('https://docs.vayva.ng');
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC Handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-app-path', (_event, name: string) => {
  return app.getPath(name as unknown);
});

ipcMain.handle('open-external', (_event, url: string) => {
  shell.openExternal(url);
});

ipcMain.handle('select-directory', async () => {
  if (!mainWindow) return { canceled: true };
  
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select Directory',
  });
  
  return result;
});

ipcMain.handle('save-file', async (_event, options: unknown) => {
  if (!mainWindow) return { canceled: true };
  
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

ipcMain.handle('open-file', async (_event, options: unknown) => {
  if (!mainWindow) return { canceled: true };
  
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});

// Database operations
ipcMain.handle('db-init', async () => {
  try {
    const userDataPath = app.getPath('userData');
    db = new Database(userDataPath);
    await db.initialize();
    return { success: true };
  } catch (error) {
    console.error('Database initialization failed:', error);
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('db-execute', async (_event, query: string, params?: unknown[]) => {
  try {
    return await db.execute(query, params);
  } catch (error) {
    console.error('Database execute error:', error);
    throw error;
  }
});

ipcMain.handle('db-query', async (_event, query: string, params?: unknown[]) => {
  try {
    return await db.query(query, params);
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
});

// App lifecycle
app.whenReady().then(async () => {
  // Initialize database
  const userDataPath = app.getPath('userData');
  db = new Database(userDataPath);
  await db.initialize();
  
  createWindow();
});

app.on('window-all-closed', () => {
  // Clean up database
  if (db) {
    db.close();
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});
