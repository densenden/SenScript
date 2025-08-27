// Desktop integration for SenScript web app
// This file provides hooks for the web app to integrate with Electron

class DesktopIntegration {
  constructor() {
    this.setupEventListeners();
    this.addDesktopStyles();
  }

  setupEventListeners() {
    if (!window.desktop) {
      console.log('Running in browser mode - desktop features unavailable');
      return;
    }

    // Settings modal trigger
    window.desktop.onOpenSettings(() => {
      console.log('Desktop requested settings modal');
      this.openSettingsModal();
    });

    // Navigation handling
    window.desktop.onNavigate(({ route }) => {
      console.log('Desktop navigation request:', route);
      this.navigateToRoute(route);
    });

    // External page handling
    window.desktop.onOpenUpgrade(({ href }) => {
      console.log('Desktop upgrade request:', href);
      this.openExternalPage(href);
    });

    window.desktop.onOpenMarketing(({ href }) => {
      console.log('Desktop marketing request:', href);
      this.openExternalPage(href);
    });

    // Audio control handling
    window.desktop.onStartListening(() => {
      console.log('Desktop start listening request');
      this.startListening();
    });

    window.desktop.onStopListening(() => {
      console.log('Desktop stop listening request');
      this.stopListening();
    });

    // Input settings
    window.desktop.onOpenMicrophoneSettings(() => {
      console.log('Desktop microphone settings request');
      this.openMicrophoneSettings();
    });

    window.desktop.onOpenOutputSettings(() => {
      console.log('Desktop output settings request');
      this.openOutputSettings();
    });
  }

  addDesktopStyles() {
    if (!window.desktop) return;

    const style = document.createElement('style');
    style.textContent = `
      /* Desktop-specific styles */
      html, body {
        -webkit-app-region: drag;
        background: transparent !important;
        margin: 0;
        padding: 0;
        overflow: hidden;
        border-radius: 52px !important;
        -webkit-border-radius: 52px !important;
      }

      /* Root container with 52px rounded corners */
      #root, .app, .app-container, [data-reactroot] {
        border-radius: 52px !important;
        -webkit-border-radius: 52px !important;
        overflow: hidden;
        background: rgba(18, 18, 18, 0.15) !important;
        backdrop-filter: blur(20px) saturate(1.2) !important;
        -webkit-backdrop-filter: blur(20px) saturate(1.2) !important;
        min-height: 100vh;
        width: 100%;
        box-sizing: border-box;
      }

      /* Apply 52px radius to main containers */
      body > div:first-child,
      body > div:first-child > *:first-child {
        border-radius: 52px !important;
        -webkit-border-radius: 52px !important;
        overflow: hidden;
      }

      /* Make interactive elements non-draggable */
      button, input, textarea, select, a, [role="button"], 
      [data-testid], .clickable, .interactive {
        -webkit-app-region: no-drag !important;
      }

      /* Custom window controls area */
      .desktop-window-controls {
        -webkit-app-region: no-drag;
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        padding: 8px;
        gap: 8px;
        background: rgba(0, 0, 0, 0.1);
        border-radius: 20px;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      }

      .desktop-window-control-btn {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .desktop-window-control-btn:hover {
        opacity: 0.8;
        transform: scale(1.1);
      }

      .desktop-close { background: #ff5f57; }
      .desktop-minimize { background: #ffbd2e; }
      .desktop-maximize { background: #28ca42; }

      /* Enhanced transparency and blur effects */
      * {
        box-sizing: border-box;
      }

      /* Force transparency on common container classes */
      .container, .wrapper, .main, .content, .layout {
        background: transparent !important;
      }

      /* Special handling for modals and overlays */
      .modal, .overlay, .popup {
        border-radius: 24px !important;
        -webkit-border-radius: 24px !important;
        backdrop-filter: blur(40px) !important;
        -webkit-backdrop-filter: blur(40px) !important;
      }

      /* Smooth animations for desktop integration */
      * {
        transition: backdrop-filter 0.3s ease, background 0.3s ease;
      }
    `;
    document.head.appendChild(style);

    // Add window controls
    this.addWindowControls();
  }

  addWindowControls() {
    const controls = document.createElement('div');
    controls.className = 'desktop-window-controls';
    controls.innerHTML = `
      <button class="desktop-window-control-btn desktop-close" onclick="window.desktop?.close()"></button>
      <button class="desktop-window-control-btn desktop-minimize" onclick="window.desktop?.minimize()"></button>
      <button class="desktop-window-control-btn desktop-maximize" onclick="window.desktop?.maximize()"></button>
    `;
    document.body.appendChild(controls);
  }

  // Integration methods - these should be implemented by the web app
  openSettingsModal() {
    // This should trigger the existing settings modal in the web app
    // Example: if using a React app with context
    if (window.appActions?.openSettings) {
      window.appActions.openSettings();
    } else {
      // Fallback: dispatch a custom event
      window.dispatchEvent(new CustomEvent('desktop-open-settings'));
    }
  }

  navigateToRoute(route) {
    // This should use the web app's router
    if (window.router?.push) {
      window.router.push(route);
    } else if (window.history?.pushState) {
      window.history.pushState({}, '', route);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }

  openExternalPage(href) {
    // For now, open in new tab - could be enhanced to use BrowserView
    window.open(href, '_blank', 'noopener,noreferrer');
  }

  startListening() {
    // This should trigger the existing audio recording functionality
    if (window.audioSystem?.start) {
      window.audioSystem.start();
    } else {
      window.dispatchEvent(new CustomEvent('desktop-start-listening'));
    }
  }

  stopListening() {
    // This should stop the existing audio recording functionality
    if (window.audioSystem?.stop) {
      window.audioSystem.stop();
    } else {
      window.dispatchEvent(new CustomEvent('desktop-stop-listening'));
    }
  }

  openMicrophoneSettings() {
    // Open microphone settings modal
    window.dispatchEvent(new CustomEvent('desktop-open-microphone-settings'));
  }

  openOutputSettings() {
    // Open output settings modal
    window.dispatchEvent(new CustomEvent('desktop-open-output-settings'));
  }
}

// Initialize desktop integration when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new DesktopIntegration();
  });
} else {
  new DesktopIntegration();
}

// Export for use by web app
window.desktopIntegration = DesktopIntegration;