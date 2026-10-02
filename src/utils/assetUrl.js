/**
 * Helper to resolve static assets correctly when deployed under a subpath
 * (e.g. GitHub Pages: /HustMapV2/ vs localhost: /)
 */
export function getAssetUrl(path) {
  if (!path) return '';
  if (/^(https?:|data:|blob:|\/\/)/i.test(path)) {
    return path;
  }

  const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL)
    ? import.meta.env.BASE_URL
    : '/';

  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${cleanBase}${cleanPath}`;
}

/**
 * Returns a fully qualified absolute URL with origin (e.g. http://localhost:3000/style/sprite/sprite)
 * Required by MapLibre GL v5+ for sprite and glyphs specification.
 */
export function getAbsoluteAssetUrl(path) {
  const relative = getAssetUrl(path);
  if (/^(https?:|\/\/)/i.test(relative)) {
    return relative;
  }
  if (typeof window !== 'undefined') {
    const origin = window.location.origin.replace(/\/$/, '');
    const cleanRelative = relative.startsWith('/') ? relative : `/${relative}`;
    // Construct directly without `new URL()` to preserve literal tokens like {fontstack} and {range}
    return `${origin}${cleanRelative}`;
  }
  return relative;
}

