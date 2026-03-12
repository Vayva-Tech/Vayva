/**
 * Add-On Sandbox - Secure execution environment for add-ons
 * 
 * Uses Web Components with Shadow DOM as primary sandbox mechanism,
 * with iframe fallback for untrusted third-party add-ons.
 */

import React, { useEffect, useRef, useState } from 'react';

export interface SandboxConfig {
  /** Unique add-on instance ID */
  instanceId: string;
  /** Add-on source (internal package name or external URL) */
  source: string;
  /** Whether this is a third-party add-on requiring stricter isolation */
  isThirdParty: boolean;
  /** Allowed permissions for this add-on */
  allowedPermissions: string[];
  /** Parent element to mount into */
  mountPoint: HTMLElement | null;
  /** Props/data passed to add-on */
  data?: Record<string, unknown>;
}

interface SandboxMessage {
  type: 'init' | 'update' | 'error' | 'ready' | 'request-permission';
  payload?: unknown;
  instanceId: string;
}

export class AddOnSandbox {
  private config: SandboxConfig;
  private iframeRef: HTMLIFrameElement | null = null;
  private shadowHost: HTMLElement | null = null;
  private messageHandlers: Map<string, (data: unknown) => void> = new Map();
  private isReady = false;

  constructor(config: SandboxConfig) {
    this.config = config;
  }

  /**
   * Initialize the sandbox and mount the add-on
   */
  async mount(): Promise<void> {
    if (this.config.isThirdParty) {
      await this.mountIframe();
    } else {
      await this.mountShadowDOM();
    }
  }

  /**
   * Update add-on with new data
   */
  update(data: Record<string, unknown>): void {
    if (!this.isReady) return;

    this.postMessage({
      type: 'update',
      payload: data,
      instanceId: this.config.instanceId,
    });
  }

  /**
   * Unmount and cleanup the sandbox
   */
  unmount(): void {
    // Remove message listener
    window.removeEventListener('message', this.handleMessage);

    // Cleanup DOM
    if (this.iframeRef?.parentNode) {
      this.iframeRef.parentNode.removeChild(this.iframeRef);
    }
    if (this.shadowHost?.parentNode) {
      this.shadowHost.parentNode.removeChild(this.shadowHost);
    }

    this.iframeRef = null;
    this.shadowHost = null;
    this.isReady = false;
  }

  /**
   * Subscribe to messages from the add-on
   */
  onMessage(type: string, handler: (data: unknown) => void): () => void {
    this.messageHandlers.set(type, handler);
    return () => this.messageHandlers.delete(type);
  }

  private async mountShadowDOM(): Promise<void> {
    if (!this.config.mountPoint) {
      throw new Error('Mount point not provided');
    }

    // Create host element
    this.shadowHost = document.createElement('div');
    this.shadowHost.id = `addon-${this.config.instanceId}`;
    this.shadowHost.style.width = '100%';
    this.shadowHost.style.height = '100%';

    // Attach shadow root
    const shadowRoot = this.shadowHost.attachShadow({ mode: 'open' });

    // Inject base styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = this.getBaseStyles();
    shadowRoot.appendChild(styleSheet);

    // Create container for React component
    const container = document.createElement('div');
    container.id = 'addon-root';
    shadowRoot.appendChild(container);

    // Mount to parent
    this.config.mountPoint.appendChild(this.shadowHost);

    // Load and execute add-on
    await this.loadAddOnModule(shadowRoot, container);

    this.isReady = true;
    this.emitReady();
  }

  private async mountIframe(): Promise<void> {
    if (!this.config.mountPoint) {
      throw new Error('Mount point not provided');
    }

    this.iframeRef = document.createElement('iframe');
    this.iframeRef.id = `addon-iframe-${this.config.instanceId}`;
    this.iframeRef.style.width = '100%';
    this.iframeRef.style.height = '100%';
    this.iframeRef.style.border = 'none';
    this.iframeRef.sandbox = 'allow-scripts allow-same-origin';
    this.iframeRef.srcdoc = this.generateIframeContent();

    // Wait for iframe to load
    await new Promise<void>((resolve) => {
      this.iframeRef!.onload = () => {
        this.isReady = true;
        this.emitReady();
        resolve();
      };
    });

    this.config.mountPoint.appendChild(this.iframeRef);
  }

  private async loadAddOnModule(
    shadowRoot: ShadowRoot,
    container: HTMLElement
  ): Promise<void> {
    // For internal add-ons, dynamically import the module
    try {
      // This would be replaced with actual dynamic imports based on add-on registry
      const module = await import(/* @vite-ignore */ this.config.source);
      
      if (module.default && typeof module.default === 'function') {
        // Execute the add-on's main function with container and data
        module.default(container, this.config.data);
      }
    } catch (error) {
      console.error(`Failed to load add-on ${this.config.instanceId}:`, error);
      this.emitError(error);
    }
  }

  private generateIframeContent(): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${this.getBaseStyles()}</style>
        </head>
        <body>
          <div id="addon-root"></div>
          <script>
            // Add-on bootstrap code for iframe sandbox
            window.addEventListener('message', (e) => {
              if (e.data.type === 'init' || e.data.type === 'update') {
                // Handle data updates
                window.__ADDON_DATA__ = e.data.payload;
              }
            });
            
            // Signal ready
            parent.postMessage({ 
              type: 'ready', 
              instanceId: '${this.config.instanceId}' 
            }, '*');
          </script>
          <script src="${this.config.source}"></script>
        </body>
      </html>
    `;
  }

  private getBaseStyles(): string {
    return `
      :host, #addon-root {
        display: block;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
      }
      
      *, *::before, *::after {
        box-sizing: inherit;
      }
      
      /* CSS Custom Properties inheritance from parent */
      :host {
        /* Typography */
        --font-family-base: inherit;
        --font-size-sm: 0.875rem;
        --font-size-base: 1rem;
        --font-size-lg: 1.125rem;
        --font-size-xl: 1.25rem;
        
        /* Colors - will be overridden by template */
        --color-primary: inherit;
        --color-secondary: inherit;
        --color-background: inherit;
        --color-surface: inherit;
        --color-text: inherit;
        --color-text-muted: inherit;
        --color-border: inherit;
        
        /* Spacing */
        --spacing-xs: 0.25rem;
        --spacing-sm: 0.5rem;
        --spacing-md: 1rem;
        --spacing-lg: 1.5rem;
        --spacing-xl: 2rem;
        
        /* Border radius */
        --radius-sm: 0.25rem;
        --radius-md: 0.5rem;
        --radius-lg: 0.75rem;
        --radius-full: 9999px;
      }
    `;
  }

  private handleMessage = (event: MessageEvent<SandboxMessage>): void => {
    if (event.data.instanceId !== this.config.instanceId) return;

    const handler = this.messageHandlers.get(event.data.type);
    if (handler) {
      handler(event.data.payload);
    }
  };

  private postMessage(message: SandboxMessage): void {
    if (this.iframeRef?.contentWindow) {
      this.iframeRef.contentWindow.postMessage(message, '*');
    } else if (this.shadowHost) {
      // For shadow DOM, dispatch custom event
      const event = new CustomEvent('addon-message', { detail: message });
      this.shadowHost.dispatchEvent(event);
    }
  }

  private emitReady(): void {
    const handler = this.messageHandlers.get('ready');
    if (handler) handler({ instanceId: this.config.instanceId });
  }

  private emitError(error: unknown): void {
    const handler = this.messageHandlers.get('error');
    if (handler) handler({ error, instanceId: this.config.instanceId });
  }
}

/**
 * React hook for managing sandbox lifecycle
 */
export function useAddOnSandbox(config: SandboxConfig) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const sandboxRef = useRef<AddOnSandbox | null>(null);

  useEffect(() => {
    const sandbox = new AddOnSandbox(config);
    sandboxRef.current = sandbox;

    sandbox.onMessage('ready', () => setIsReady(true));
    sandbox.onMessage('error', (data: unknown) => {
      const err = (data as { error?: Error })?.error || new Error('Unknown add-on error');
      setError(err);
    });

    sandbox.mount().catch(setError);

    return () => {
      sandbox.unmount();
    };
  }, [config.instanceId]);

  const update = (data: Record<string, unknown>) => {
    sandboxRef.current?.update(data);
  };

  return { isReady, error, update };
}
