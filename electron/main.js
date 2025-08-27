const { app, BrowserWindow, Menu, shell, ipcMain, dialog } = require('electron');
const path = require('path');
const url = require('url');

const isMac = process.platform === 'darwin';
const isDev = process.env.NODE_ENV === 'development';

// Suppress harmless Chromium errors before app initialization
app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion,VizDisplayCompositor');
app.commandLine.appendSwitch('disable-gpu-sandbox');
app.commandLine.appendSwitch('ignore-certificate-errors');
app.commandLine.appendSwitch('disable-dev-shm-usage');
app.commandLine.appendSwitch('disable-logging');
app.commandLine.appendSwitch('log-level', '3'); // Only show fatal errors

let mainWindow;

/** Domain allowlist for in-app external navigation */
const ALLOWLIST = [
  'script.sen.studio',
  'getscript.sen.studio',
  'checkout.stripe.com',
  'localhost',
];

function isAllowedExternal(targetURL) {
  try {
    const u = new URL(targetURL);
    return ALLOWLIST.includes(u.host) || u.host.startsWith('localhost');
  } catch {
    return false;
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000', // Completely transparent
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false, // Set to false for development
      backgroundThrottling: false, // Prevent throttling when window is not visible
      webSecurity: false, // Allow media access for development
      allowRunningInsecureContent: true,
      experimentalFeatures: true,
      enableRemoteModule: false,
    },
    titleBarStyle: 'hiddenInset',
    vibrancy: 'ultra-dark', // macOS vibrancy effect
    visualEffectState: 'followWindow',
    roundedCorners: true, // Enable rounded corners on supported platforms
    hasShadow: false, // Remove window shadow for cleaner desktop integration
  });

  // Beautiful window setup
  if (isMac) {
    mainWindow.setWindowButtonVisibility(false);
  }

  // Set window to be completely transparent initially
  mainWindow.setBackgroundColor('#00000000');

  if (isDev) {
    mainWindow.loadURL('http://localhost:3001');
    // mainWindow.webContents.openDevTools(); // Commented out - open manually if needed
  } else {
    mainWindow.loadURL('https://script.sen.studio');
  }

  // Handle media permissions - be more explicit
  mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    console.log('Permission requested:', permission);
    
    // Allow all media-related permissions
    const allowedPermissions = [
      'microphone',
      'camera', 
      'audioCapture',
      'videoCapture',
      'displayCapture',
      'media',
      'mediaKeySystem',
      'geolocation',
      'notifications',
      'midi',
      'midiSysex'
    ];
    
    if (allowedPermissions.includes(permission)) {
      console.log('Granting permission:', permission);
      callback(true);
    } else {
      console.log('Denying permission:', permission);
      callback(false);
    }
  });

  // Handle display media (screen capture) requests
  mainWindow.webContents.session.setDisplayMediaRequestHandler((request, callback) => {
    console.log('Display media requested');
    // Auto-approve with both video and audio
    callback({ video: true, audio: true });
  });

  // Inject desktop styles after page loads
  mainWindow.webContents.on('did-finish-load', () => {
    const fs = require('fs');
    const cssPath = path.join(__dirname, 'desktop-styles.css');
    const css = fs.readFileSync(cssPath, 'utf8');
    mainWindow.webContents.insertCSS(css);
  });

  // Prevent unknown hosts from opening in-window
  mainWindow.webContents.setWindowOpenHandler(({ url: target }) => {
    if (isAllowedExternal(target)) {
      shell.openExternal(target);
      return { action: 'deny' };
    }
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, target) => {
    const targetUrl = new URL(target);
    const currentUrl = mainWindow.webContents.getURL();
    
    if (!isAllowedExternal(target) && 
        !target.startsWith('http://localhost:3001') && 
        !target.startsWith('https://script.sen.studio') &&
        !target.startsWith('file:')) {
      event.preventDefault();
    }
  });

  const menu = Menu.buildFromTemplate(buildMenuTemplate());
  Menu.setApplicationMenu(menu);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Window resize presets
  setupWindowPresets();
}

function setupWindowPresets() {
  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  // Store preset functions
  global.windowPresets = {
    horizontal: () => {
      const width = Math.floor(screenWidth * 0.9);
      const height = Math.max(700, Math.floor(screenHeight * 0.25)); // Min height 700px
      mainWindow.setBounds({
        x: Math.floor((screenWidth - width) / 2),
        y: screenHeight - height,
        width,
        height
      });
    },
    vertical: () => {
      const width = Math.floor(screenWidth * 0.25);
      const height = Math.floor(screenHeight * 0.9);
      mainWindow.setBounds({
        x: screenWidth - width,
        y: Math.floor((screenHeight - height) / 2),
        width,
        height
      });
    },
    initial: () => {
      mainWindow.setBounds({
        x: Math.floor((screenWidth - 1280) / 2),
        y: Math.floor((screenHeight - 800) / 2),
        width: 1280,
        height: 800
      });
    },
    compact: () => {
      const width = Math.min(1920, screenWidth * 0.8);
      const height = Math.min(1080, screenHeight * 0.8);
      mainWindow.setBounds({
        x: Math.floor((screenWidth - width) / 2),
        y: Math.floor((screenHeight - height) / 2),
        width,
        height
      });
    }
  };
}

function buildMenuTemplate() {
  const appMenu = isMac ? [{
    label: app.name,
    submenu: [
      { label: 'About ' + app.name, role: 'about' },
      { type: 'separator' },
      {
        label: 'Preferences…',
        accelerator: 'CmdOrCtrl+,',
        click: () => mainWindow?.webContents.send('open-settings')
      },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  }] : [];

  const fileMenu = {
    label: 'File',
    submenu: [
      {
        label: 'New Window',
        accelerator: 'CmdOrCtrl+N',
        click: createWindow
      },
      isMac ? { role: 'close' } : { role: 'quit' }
    ]
  };

  const inputMenu = {
    label: 'Input',
    submenu: [
      {
        label: 'Microphone Settings',
        click: () => mainWindow?.webContents.send('open-microphone-settings')
      },
      {
        label: 'Device Output',
        click: () => mainWindow?.webContents.send('open-output-settings')
      }
    ]
  };

  const listeningMenu = {
    label: 'Listening',
    submenu: [
      {
        label: 'Start',
        accelerator: 'CmdOrCtrl+Space',
        click: () => mainWindow?.webContents.send('start-listening')
      },
      {
        label: 'Stop',
        accelerator: 'CmdOrCtrl+Shift+Space',
        click: () => mainWindow?.webContents.send('stop-listening')
      }
    ]
  };

  const viewMenu = {
    label: 'View',
    submenu: [
      ...(isDev ? [
        { role: 'reload' },
        { role: 'forcereload' },
        { role: 'toggledevtools' },
        { type: 'separator' }
      ] : []),
      { role: 'togglefullscreen' },
      { type: 'separator' },
      {
        label: 'Window Presets',
        submenu: [
          {
            label: 'Horizontal Strip',
            click: () => global.windowPresets?.horizontal()
          },
          {
            label: 'Vertical Strip',
            click: () => global.windowPresets?.vertical()
          },
          {
            label: 'Initial Size',
            click: () => global.windowPresets?.initial()
          },
          {
            label: 'Compact',
            click: () => global.windowPresets?.compact()
          }
        ]
      }
    ]
  };

  const navigateMenu = {
    label: 'Navigate',
    submenu: [
      {
        label: 'Home',
        accelerator: 'CmdOrCtrl+H',
        click: () => mainWindow?.webContents.send('navigate', { route: '/' })
      },
      {
        label: 'Settings',
        accelerator: 'CmdOrCtrl+,',
        click: () => mainWindow?.webContents.send('open-settings')
      },
      {
        label: 'Account',
        click: () => mainWindow?.webContents.send('navigate', { route: '/account' })
      },
      {
        label: 'Upgrade / Billing',
        accelerator: 'CmdOrCtrl+U',
        click: () => mainWindow?.webContents.send('open-upgrade', {
          href: 'https://getscript.sen.studio/pricing'
        })
      }
    ]
  };

  const helpMenu = {
    label: 'Help',
    submenu: [
      {
        label: 'Docs / FAQ',
        click: () => mainWindow?.webContents.send('open-marketing', {
          href: 'https://getscript.sen.studio/faq'
        })
      },
      {
        label: 'Website',
        click: () => mainWindow?.webContents.send('open-marketing', {
          href: 'https://getscript.sen.studio/'
        })
      },
      {
        label: 'Contact Support',
        click: () => mainWindow?.webContents.send('open-marketing', {
          href: 'https://getscript.sen.studio/contact'
        })
      }
    ]
  };

  return [
    ...appMenu,
    fileMenu,
    inputMenu,
    listeningMenu,
    viewMenu,
    navigateMenu,
    helpMenu
  ];
}

app.whenReady().then(async () => {
  // Request system permissions for media access on macOS
  if (isMac) {
    try {
      const { systemPreferences } = require('electron');
      
      // Check and request microphone permission
      const micStatus = systemPreferences.getMediaAccessStatus('microphone');
      console.log('Microphone permission status:', micStatus);
      
      if (micStatus !== 'granted') {
        console.log('Requesting microphone permission...');
        const granted = await systemPreferences.askForMediaAccess('microphone');
        console.log('Microphone permission granted:', granted);
      }
      
      // Check and request screen recording permission
      const screenStatus = systemPreferences.getMediaAccessStatus('screen');
      console.log('Screen recording permission status:', screenStatus);
      
    } catch (error) {
      console.log('Permission check failed:', error);
    }
  }
  
  createWindow();
  
  // macOS dock behavior
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit();
  }
});

// IPC Handlers
ipcMain.handle('get-platform', () => process.platform);
ipcMain.handle('is-dev', () => isDev);

// Desktop capture sources for system audio
ipcMain.handle('get-desktop-sources', async () => {
  const { desktopCapturer } = require('electron');
  try {
    const sources = await desktopCapturer.getSources({
      types: ['window', 'screen'],
      thumbnailSize: { width: 150, height: 150 }
    });
    return sources.map(source => ({
      id: source.id,
      name: source.name,
      type: source.id.startsWith('window:') ? 'window' : 'screen'
    }));
  } catch (error) {
    console.error('Error getting desktop sources:', error);
    return [];
  }
});

// Window control handlers
ipcMain.on('minimize-window', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.minimize();
  }
});

ipcMain.on('maximize-window', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('close-window', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.close();
  }
});