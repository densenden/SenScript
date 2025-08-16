import { app, BrowserWindow, session } from "electron";
import path from "node:path";

let win: BrowserWindow;

// Add Chrome flags to enable speech recognition
app.commandLine.appendSwitch('--enable-speech-input');
app.commandLine.appendSwitch('--enable-web-speech-api');
app.commandLine.appendSwitch('--disable-web-security');
app.commandLine.appendSwitch('--allow-running-insecure-content');
app.commandLine.appendSwitch('--use-fake-ui-for-media-stream');

app.whenReady().then(() => {
  // Handle microphone permissions
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'media') {
      callback(true); // Grant microphone permission
    } else {
      callback(false);
    }
  });

  // Set permissions for media devices
  session.defaultSession.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
    if (permission === 'media') {
      return true;
    }
    return false;
  });

  win = new BrowserWindow({
    width: 480,
    height: 800,
    frame: false,              // no OS chrome
    transparent: true,         // allow see-through
    resizable: false,          // required for transparency
    alwaysOnTop: true,
    backgroundColor: "#00000000", // full alpha
    titleBarStyle: "hiddenInset", // macOS
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
      webSecurity: false,       // Allow microphone access
      allowRunningInsecureContent: true,  // Allow speech recognition
      experimentalFeatures: true,  // Enable experimental web features
      enableRemoteModule: false,
      sandbox: false            // Disable sandbox for speech API
    }
  });

  // macOS blur/vibrancy - choose one type
  win.setVibrancy("under-window");        // or "sidebar" / "window"
  
  // setVisualEffectState pairs with vibrancy
  try {
    (win as any).setVisualEffectState?.("active");
  } catch (e) {
    // Ignore if not available in this Electron version
  }

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:3000');
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