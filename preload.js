// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  openFolderDialog: () => ipcRenderer.invoke('dialog:open'),
  scanDirectory: (path, options) => ipcRenderer.invoke('dir:scan', path, options),
  saveFileDialog: () => ipcRenderer.invoke('dialog:save-file'),
  saveFile: (path, content) => ipcRenderer.invoke('file:save', path, content)
});