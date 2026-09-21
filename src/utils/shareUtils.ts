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
export async function shareContent(options: ShareOptions): Promise<'shared' | 'copied'> {
  const { title, text, url } = options;

  // 1. Check if the user's browser supports the native Web Share UI
  if (navigator.share) {
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
      console.warn('[shareContent] Native share failed, falling back to clipboard:', err);
    }
  }

  // 2. Fallback for desktop or unsupported environments: Copy link to clipboard
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

  return 'copied';
}
