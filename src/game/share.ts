export type ShareOutcome = 'shared' | 'copied' | 'unsupported';

/**
 * Best-effort share: tries the Web Share API first (native share sheet on
 * phones/some desktop browsers), falls back to copying to the clipboard,
 * and never throws - sharing is a nice-to-have, not something that should
 * ever block or crash the result screen.
 */
export async function shareText(text: string): Promise<ShareOutcome> {
  try {
    if (typeof navigator !== 'undefined' && typeof (navigator as any).share === 'function') {
      await (navigator as any).share({ text });
      return 'shared';
    }
  } catch {
    // User cancelled, or share failed - fall through to clipboard.
  }
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return 'copied';
    }
  } catch {
    // ignore
  }
  return 'unsupported';
}
