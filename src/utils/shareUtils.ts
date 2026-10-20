export interface ShareOptions {
  title: string;
  text?: string;
  url: string;
}

/**
 * Triggers the browser's native Web Share API (which opens the native mobile operating system's
 * share UI containing apps like WhatsApp, X/Twitter, Quick Share, etc.).
 * Falls back to clipboard copying if Web Share is unavailable (e.g. on desktop).
 */
export interface ShareOptions {
  title: string;
  text?: string;
  url: string;
}

/**
 * Triggers the browser's native Web Share API (which opens the native mobile operating system's
 * share UI containing apps like WhatsApp, X/Twitter, Quick Share, etc.).
 * Falls back to clipboard copying or 'need-user-gesture' if Web Share is unavailable or timed out.
 */
export async function shareContent(options: ShareOptions): Promise<'shared' | 'copied' | 'need-user-gesture'> {
  const { title, text, url } = options;

  // 1. Check if the user's browser supports the native Web Share UI
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: title || 'Spiritual Hymns',
        text: text || title,
        url: url || window.location.href,
      });
      return 'shared';
    } catch (err: any) {
      // User cancelled/closed the native share sheet
      if (err.name === 'AbortError') {
        return 'shared';
      }
      if (err.name === 'NotAllowedError') {
        console.warn('[shareContent] User gesture expired for native share, returning need-user-gesture');
        try {
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(url);
          }
        } catch (_) {}
        return 'need-user-gesture';
      }
      console.warn('[shareContent] Native share failed, falling back to clipboard:', err);
    }
  }

  // 2. Fallback for desktop or unsupported environments: Copy link to clipboard
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(url);
    } else {
      const input = document.createElement('textarea');
      input.value = url;
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.focus();
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
  } catch (err) {
    console.error('[shareContent] Clipboard fallback error:', err);
  }

  return 'copied';
}
