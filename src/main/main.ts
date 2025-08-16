import { app, BrowserWindow } from "electron";
import path from "node:path";

let win: BrowserWindow;

app.whenReady().then(() => {
  win = new BrowserWindow({
    width: 420,
    height: 720,
    frame: false,              // no OS chrome
    transparent: true,         // allow see-through
    resizable: false,          
    alwaysOnTop: true,
    backgroundColor: "#00000000", // full alpha
    titleBarStyle: "hiddenInset", // macOS
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js")
    }
  });

  // macOS blur/vibrancy
  win.setVibrancy("under-window");
  // setVisualEffectState is not in all Electron versions
  try {
    (win as any).setVisualEffectState?.("active");
  } catch (e) {
    // Ignore if not available
  }

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:9000');
    // Don't open dev tools automatically as it breaks transparency
  } else {
    win.loadFile(path.join(__dirname, "index.html"));
  }

  win.on('closed', () => {
    win = null as any;
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    app.whenReady().then(() => {
      // Recreate window
    });
  }
});