const { app, BrowserWindow, Menu, shell, dialog, ipcMain } = require('electron');
const { scanDirectory } = require('./scanner');

// Prevent squirrel on Windows from crashing startup
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      preload: __dirname + '/preload.js',
      contextIsolation: true
    }
  });

  mainWindow.loadFile('index.html');

  // Optional: Open DevTools by default (great for debugging)
  mainWindow.webContents.openDevTools();
}

// Only create window and set up IPC once
app.whenReady().then(() => {
  createWindow();

  // Build the application menu
  const template = [
    ...(process.platform === 'darwin'
      ? [
          {
            label: app.getName(),
            submenu: [
              { role: 'about' },
              { type: 'separator' },
              { role: 'services' },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideothers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit' }
            ]
          }
        ]
      : []),

    {
      label: 'File',
      submenu: [
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Alt+F4',
          click: () => app.quit()
        }
      ]
    },

    {
      label: 'Help',
      role: 'help',
      submenu: [
        {
          label: 'User Guide',
          click: () => shell.openExternal('https://github.com/tonyflanigan/beachy-Directory-Tree-Printer/blob/main/README.md')
        },
        {
          label: 'Visit BeachyFree',
          click: () => shell.openExternal('https://beachy.co.za/beachyfree')
        },
        {
          label: 'Send Feedback',
          click: () => shell.openExternal('https://beachy.co.za/beachyfree-feedback')
        },
        {
          label: 'Report a Bug',
          click: () => shell.openExternal('https://github.com/tonyflanigan/beachy-Directory-Tree-Printer/issues')
        },
        {
          label: 'Changelog',
          click: () => shell.openExternal('https://github.com/tonyflanigan/beachy-Directory-Tree-Printer')
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // ✅ IPC Handlers - Registered ONCE here
  ipcMain.handle('dialog:open', async () => {
    try {
      const result = await dialog.showOpenDialog({
        title: 'Select a folder to scan',
        properties: ['openDirectory']
      });
      return result.canceled ? null : result.filePaths[0];
    } catch (err) {
      console.error('Dialog error:', err);
      return null;
    }
  });

  ipcMain.handle('dir:scan', async (event, path, options) => {
    try {
      const tree = await scanDirectory(path, options);
      return { success: true, tree };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('dialog:save-file', async () => {
    try {
      const result = await dialog.showSaveDialog({
        title: 'Save Directory Tree',
        defaultPath: 'directory-tree.txt',
        filters: [{ name: 'Text Files', extensions: ['txt'] }]
      });
      return result.canceled ? null : result.filePath;
    } catch (err) {
      console.error('Save dialog error:', err);
      return null;
    }
  });

  ipcMain.handle('file:save', async (event, path, content) => {
    try {
      const { writeFile } = require('fs');
      await new Promise((resolve, reject) => {
        writeFile(path, content, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      return true;
    } catch (err) {
      console.error('Save file error:', err);
      return false;
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});