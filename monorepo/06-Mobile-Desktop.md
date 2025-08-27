# 06-Desktop-Menu-and-Upgrade.md

## Goal
Enhance the Electron desktop app so that:
1. The existing web app (`script.sen.studio`) renders inside the Electron window.
2. The Settings modal can be opened from both the in-app UI and the **OS menu**.
3. Users can access and complete upgrade/billing flows directly from the app via pages from the marketing site, especially:
   - `https://getscript.sen.studio/pricing`
   - `https://getscript.sen.studio/` (home/marketing)
   - `https://getscript.sen.studio/more-information` or similar support pages
4. The desktop app exposes a **native menu** that mirrors the product’s information architecture: Settings, Account/Auth, Billing/Upgrade, Help/Docs, and Marketing subpages.
5. The UX respects our existing design system (Tailwind) and maintains frameless, rounded window specs.

---

## Requirements (Recap)
- Frameless window, rounded corners 52px, transparent background (25% opacity of web theme).
- Dev loads: `http://localhost:3001` (WebApp).
- Prod loads:  live app on vercel (script.sen.studio).
- UI is primarily the WebApp; native menu triggers:
  - Opening Settings modal in the web app
  - Navigating marketing/billing pages (pricing, faq, etc.)
  - Window resize via menu toggles
  - Window resizing freely possible
- Offline not required (OK to rely on network for marketing pages and auth flows).

---

## Architecture Additions

### 1) Electron Menu Template
- A dynamic menu that:
  - Sends IPC messages to the renderer to open the **Settings modal** (native menu → web modal).
  - Triggers navigation to **pricing/upgrade** page, **account**, **help/docs**, and **marketing** pages either:
    - inside the current web app (if routes exist), or
    - via a secondary BrowserView/child window that loads the marketing site.

- macOS adds an App menu; Windows/Linux start with File/Help menus.

### 2) IPC Contract
- `ipcMain` listens for menu events, emits to renderer via `webContents.send`.
- Renderer listens (using `preload.js` + `contextBridge`) for:
  - `open-settings`
  - `open-upgrade`
  - `open-marketing` (with a path)
  - control input toggle, start/stop listening
- Renderer dispatches the appropriate actions:
  - Show Settings modal in the SPA.
  - Navigate the SPA route or open an embedded view.

### 3) Navigation Strategies
- Primary: If the WebApp includes `/settings`, `/account`, `/billing` routes, navigate internally.
- Secondary: For external pages (e.g., `getscript.sen.studio/pricing`), open a controlled **BrowserView** (preferred) or **modal BrowserWindow**:
  - Same frameless styling is not necessary; keep standard child window with controllable chrome (still consistent with product).
  - Allow only whitelisted domains.

---

## Security & Hardening
- `contextIsolation: true`, `nodeIntegration: false`.
- Sanitize external URLs and **whitelist** allowed domains: `script.sen.studio`, `getscript.sen.studio`, `*.stripe.com` (if needed for checkout).
- Block `new-window` and `will-navigate` for unknown hosts.
- Use `shell.openExternal` for non-critical external links.

---

## Menu Information Architecture
Add menu icons from material suite width 100, 
Top-level (macOS style shown; Windows/Linux merge App items under File/Help):
- App (macOS only)
  - About
  - Preferences… → triggers Settings modal
  - Hide, Quit
- File
  - New Window (optional)
  - Close Window
 - Input 
  - Microphone
  - Device Output
 - Listening 
   - Start
   - Stop 
- View
  - Reload (Dev only)
  - Toggle DevTools (Dev only)
  - Toggle Full Screen
    - Window resize via menu, with icons:
   aspect ratio presets with 
    - horizontal (width: 100%, height 25% of desktop), bottom aligned
    - vertical, (width: 25%, height 100% of desktop), right aligned
    - initial 
    - compact (1920 x 1080)
    - compact horizontal (1080 x 1920)
- Navigate
  - Home (WebApp root)
  - Settings (opens modal via IPC)
  - Account (navigates to `/account` in WebApp, or opens marketing login page if web app is unauthenticated UI)
  - Upgrade/Billing (opens `getscript.sen.studio/pricing` in a controlled view)
- Help
  - Docs/FAQ (opens `getscript.sen.studio/faq`)
  - Contact/Support (getscript.sen.studio/contact)


Dynamic states:
- If user is authenticated, show “Account”, “Manage Subscription”.
- If unauthenticated, show “Sign In / Create Account”.

---

## Example: `main.js` (Menu + Window + Navigation)

```js
const { app, BrowserWindow, Menu, shell, ipcMain, dialog } = require('electron');
const path = require('path');
const url = require('url');

const isMac = process.platform === 'darwin';
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

/** Domain allowlist for in-app external navigation */
const ALLOWLIST = [
  'script.sen.studio',
  'getscript.sen.studio',
  'checkout.stripe.com',
];

function isAllowedExternal(targetURL) {
  try {
    const u = new URL(targetURL);
    return ALLOWLIST.includes(u.host);
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
    backgroundColor: '#12121240',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3001');
  } else {
    mainWindow.loadFile(path.join(__dirname, 'build', 'index.html'));
  }

  // Prevent unknown hosts from opening in-window
  mainWindow.webContents.setWindowOpenHandler(({ url: target }) => {
    if (isAllowedExternal(target)) {
      // Decide: keep inside app (BrowserView) or open external
      shell.openExternal(target);
      return { action: 'deny' };
    }
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, target) => {
    if (!isAllowedExternal(target) && !target.startsWith('http://localhost:3001') && !target.startsWith('file:')) {
      event.preventDefault();
    }
  });

  const menu = Menu.buildFromTemplate(buildMenuTemplate());
  Menu.setApplicationMenu(menu);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
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
      isMac ? { role: 'close' } : { role: 'quit' }
    ]
  };

  const viewMenu = {
    label: 'View',
    submenu: [
      ...(isDev ? [{ role: 'reload' }, { role: 'forcereload' }, { role: 'toggledevtools' }, { type: 'separator' }] : []),
      { role: 'togglefullscreen' }
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
      }
    ]
  };

  return [
    ...appMenu,
    fileMenu,
    viewMenu,
    navigateMenu,
    helpMenu
  ];
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (!isMac) app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});


⸻

Example: preload.js (IPC Bridge)

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  onOpenSettings: (cb) => ipcRenderer.on('open-settings', cb),
  onOpenUpgrade: (cb) => ipcRenderer.on('open-upgrade', (event, payload) => cb(payload)),
  onNavigate: (cb) => ipcRenderer.on('navigate', (event, payload) => cb(payload)),
  onOpenMarketing: (cb) => ipcRenderer.on('open-marketing', (event, payload) => cb(payload)),
});

Renderer (WebApp) usage example (pseudo-React):

useEffect(() => {
  if (!window.desktop) return;

  // Open the SPA's Settings modal
  window.desktop.onOpenSettings(() => {
    openSettingsModal(); // your existing UI logic
  });

  // Navigate inside SPA
  window.desktop.onNavigate(({ route }) => {
    router.push(route); // Next.js router
  });

  // Open external marketing/upgrade inside in-app view or new tab
  window.desktop.onOpenUpgrade(({ href }) => {
    // Option A: In-app SPA route for billing if available
    // router.push('/billing')

    // Option B: Controlled external open (replace with in-app BrowserView if implemented)
    window.open(href, '_blank'); // or emit event to open a native child window
  });

  window.desktop.onOpenMarketing(({ href }) => {
    window.open(href, '_blank');
  });
}, []);


⸻

Optional: In-app BrowserView for Marketing Pages

If you prefer an embedded experience over window.open:
	•	Create a lightweight child BrowserWindow or attach a BrowserView to the main window.
	•	Show a top bar with a close/back button matching the Sen design.
	•	Only load pages from the allowlist.

Example (sketch):

const { BrowserView } = require('electron');

function openMarketingView(targetUrl) {
  if (!isAllowedExternal(targetUrl)) {
    return;
  }
  const view = new BrowserView({
    webPreferences: {
      contextIsolation: true,
      sandbox: true
    }
  });
  mainWindow.setBrowserView(view);
  view.setBounds({ x: 0, y: 64, width: 1280, height: 736 }); // leave space for custom toolbar
  view.webContents.loadURL(targetUrl);
}

Wire it by listening to IPC in main.js:

ipcMain.on('open-marketing-view', (event, { href }) => {
  openMarketingView(href);
});

Renderer:

// Instead of window.open
window.electron?.openMarketingView?.('https://getscript.sen.studio/pricing');

(Expose a safe openMarketingView in preload.js via contextBridge.)

⸻

Settings Modal via OS Menu
	•	The Settings modal already exists in the WebApp.
	•	The menu triggers an IPC open-settings event.
	•	The renderer opens the modal (openSettingsModal()).
	•	Ensure Settings is routable (/settings) to allow deep link via menu “Navigate → Settings”.

⸻

Auth & Account Integration
	•	“Account” menu item navigates to /account.
	•	The SPA checks auth; if not logged in, show sign-in.
	•	If logged in, show profile and subscription status.

⸻

Upgrade Flow
	•	“Upgrade/Billing” menu item calls open-upgrade with href: https://getscript.sen.studio/pricing.
	•	Preferred UX: open a controlled in-app BrowserView with a minimal toolbar so users complete purchase without leaving the app.
	•	Whitelist Stripe domains for checkout if necessary.

⸻

Styling & Design
	•	Maintain frameless window, rounded corners, and 25% transparent background.
	•	Internal SPA shell provides a top “drag region” via -webkit-app-region: drag.
	•	Any in-app toolbar buttons must be inside a non-draggable region (-webkit-app-region: no-drag).
	•	Use Sen design system (Tailwind) for any UI variants needed for desktop.

⸻

Open Questions
	•	Should we persist a “Last opened marketing page” and restore it on relaunch?
	•	Do we show an in-app breadcrumb or “Back to App” button when a marketing page is open in BrowserView?
	•	Do we add a tray icon with quick actions (Open, Settings, Quit)?

⸻

QA Checklist
	•	Menu items:
	•	macOS App menu: Preferences… opens Settings modal.
	•	Navigate → Settings/account/upgrade routes work as expected.
	•	Help → FAQ/Website opens pages as configured.
	•	Security:
	•	Only allowlisted domains load in BrowserView.
	•	Unknown new-window requests are blocked.
	•	Platforms:
	•	macOS (Intel + M1), Windows, Linux basic smoke tests.
	•	Offline:
	•	WebApp build works locally; marketing pages require connectivity (acceptable).

