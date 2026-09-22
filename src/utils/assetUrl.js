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
