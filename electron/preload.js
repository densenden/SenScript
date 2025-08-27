const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  // Settings and preferences
  onOpenSettings: (cb) => ipcRenderer.on('open-settings', cb),
  onOpenMicrophoneSettings: (cb) => ipcRenderer.on('open-microphone-settings', cb),
  onOpenOutputSettings: (cb) => ipcRenderer.on('open-output-settings', cb),
  
  // Navigation
  onNavigate: (cb) => ipcRenderer.on('navigate', (event, payload) => cb(payload)),
  onOpenUpgrade: (cb) => ipcRenderer.on('open-upgrade', (event, payload) => cb(payload)),
  onOpenMarketing: (cb) => ipcRenderer.on('open-marketing', (event, payload) => cb(payload)),
  
  // Audio controls
  onStartListening: (cb) => ipcRenderer.on('start-listening', cb),
  onStopListening: (cb) => ipcRenderer.on('stop-listening', cb),
  
  // Platform info
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  isDev: () => ipcRenderer.invoke('is-dev'),
  
  // Desktop capture sources (for system audio)
  getDesktopSources: () => ipcRenderer.invoke('get-desktop-sources'),
  
  // Window controls
  minimize: () => ipcRenderer.send('minimize-window'),
  maximize: () => ipcRenderer.send('maximize-window'),
  close: () => ipcRenderer.send('close-window'),
});

// Remove listeners on page unload
window.addEventListener('beforeunload', () => {
  ipcRenderer.removeAllListeners('open-settings');
  ipcRenderer.removeAllListeners('open-microphone-settings');
  ipcRenderer.removeAllListeners('open-output-settings');
  ipcRenderer.removeAllListeners('navigate');
  ipcRenderer.removeAllListeners('open-upgrade');
  ipcRenderer.removeAllListeners('open-marketing');
  ipcRenderer.removeAllListeners('start-listening');
  ipcRenderer.removeAllListeners('stop-listening');
});