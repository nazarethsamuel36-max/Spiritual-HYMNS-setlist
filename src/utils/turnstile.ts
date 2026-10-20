/**
 * Helper to obtain a single-use Cloudflare Turnstile verification token.
 * Uses the Turnstile script loaded in index.html in 'managed' mode.
 */

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          'error-callback'?: (error: any) => void;
          'expired-callback'?: () => void;
          action?: string;
          size?: 'normal' | 'compact' | 'flexible' | 'invisible';
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAAFaUaF0aE8YqHJa7';

let prewarmedShareToken: { token: string; timestamp: number } | null = null;
let isPrewarming = false;

async function requestTurnstileToken(action: 'share' | 'download'): Promise<string> {
  // If no turnstile loaded or site key missing, proceed gracefully in development
  if (typeof window === 'undefined') {
    throw new Error('Turnstile can only run in a browser environment');
  }

  // Wait up to 3 seconds for window.turnstile script to be ready
  let attempts = 0;
  while (!window.turnstile && attempts < 30) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    attempts++;
  }

  if (!window.turnstile) {
    console.warn('[Turnstile] Script not available, bypassing or failing');
    // If running offline or blocked by adblock, pass empty or fail
    return '';
  }

  return new Promise((resolve, reject) => {
    // Create an invisible ephemeral container
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.bottom = '-9999px';
    container.style.left = '-9999px';
    container.style.opacity = '0';
    container.style.pointerEvents = 'none';
    document.body.appendChild(container);

    let widgetId = '';
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Turnstile challenge timed out. Please check your internet connection.'));
    }, 12000);

    const cleanup = () => {
      clearTimeout(timeout);
      try {
        if (widgetId && window.turnstile) {
          window.turnstile.remove(widgetId);
        }
      } catch (e) {
        // ignore cleanup error
      }
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    };

    const turnstile = window.turnstile;
    if (!turnstile) {
      cleanup();
      resolve('');
      return;
    }

    try {
      widgetId = turnstile.render(container, {
        sitekey: TURNSTILE_SITE_KEY,
        action,
        size: 'invisible',
        callback: (token: string) => {
          cleanup();
          resolve(token);
        },
        'error-callback': (err: any) => {
          cleanup();
          console.error('[Turnstile] Error callback:', err);
          reject(new Error('Turnstile bot verification failed'));
        },
        'expired-callback': () => {
          cleanup();
          reject(new Error('Turnstile token expired. Please try again.'));
        },
      });
    } catch (e) {
      cleanup();
      reject(e);
    }
  });
}

/**
 * Pre-warms a Turnstile token in advance so subsequent share actions
 * execute in milliseconds and preserve browser user gesture for native sharing.
 */
export async function prewarmTurnstileToken(action: 'share' | 'download' = 'share'): Promise<void> {
  if (typeof window === 'undefined' || isPrewarming) return;
  // If we have a cached token younger than 4 minutes (Cloudflare tokens last 5 mins), reuse it
  if (prewarmedShareToken && Date.now() - prewarmedShareToken.timestamp < 240000) {
    return;
  }

  isPrewarming = true;
  try {
    const token = await requestTurnstileToken(action);
    if (token) {
      prewarmedShareToken = { token, timestamp: Date.now() };
    }
  } catch (e) {
    console.warn('[Turnstile] Prewarm warning:', e);
  } finally {
    isPrewarming = false;
  }
}

export async function getTurnstileToken(action: 'share' | 'download' = 'download'): Promise<string> {
  if (action === 'share' && prewarmedShareToken && Date.now() - prewarmedShareToken.timestamp < 240000) {
    const token = prewarmedShareToken.token;
    prewarmedShareToken = null;
    // Re-warm next token in background after a brief delay
    setTimeout(() => {
      void prewarmTurnstileToken('share');
    }, 1500);
    return token;
  }

  return requestTurnstileToken(action);
}
