/**
 * MapLibre GL Loader with CDN Priority and Full Offline Standalone Fallback
 * 
 * 1. Online: Loads MapLibre GL v6 directly from fast global CDN (jsDelivr) to save host bandwidth.
 * 2. Offline / CDN failure / Timeout: Automatically switches to 100% local copy in /vendor/maplibre-gl/.
 */

import { getAssetUrl } from './assetUrl.js';

let maplibreInstance = null;
let loadPromise = null;

export async function getMapLibre() {
  if (maplibreInstance) {
    return maplibreInstance;
  }
  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = (async () => {
    // 0. Check global window.maplibregl if previously injected
    if (typeof window !== 'undefined' && window.maplibregl && window.maplibregl.Map) {
      maplibreInstance = window.maplibregl;
      return maplibreInstance;
    }

    // 1. Try Free Global CDN (jsDelivr) if online
    const isOnline = typeof navigator === 'undefined' || navigator.onLine !== false;
    if (isOnline && typeof window !== 'undefined') {
      try {
        const cdnUrl = 'https://cdn.jsdelivr.net/npm/maplibre-gl@6.11.2/dist/maplibre-gl.mjs';
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('CDN request timeout (2500ms)')), 2500)
        );

        const cdnModule = await Promise.race([
          import(/* @vite-ignore */ cdnUrl),
          timeoutPromise
        ]);

        if (cdnModule && (cdnModule.Map || cdnModule.default?.Map)) {
          console.log('[HustMap] Successfully loaded MapLibre GL from CDN');
          maplibreInstance = cdnModule.Map ? cdnModule : (cdnModule.default || cdnModule);
          return maplibreInstance;
        }
      } catch (cdnErr) {
        console.warn('[HustMap] CDN unreachable or timed out, switching to local offline fallback:', cdnErr.message);
      }
    }

    // 2. Full Offline Fallback: Load 100% local standalone bundle from public/vendor/
    if (typeof window !== 'undefined') {
      try {
        const localPath = getAssetUrl('/vendor/maplibre-gl/maplibre-gl.mjs');
        const localModule = await import(/* @vite-ignore */ localPath);
        console.log('[HustMap] Loaded MapLibre GL from local offline storage (/vendor/maplibre-gl/)');
        maplibreInstance = localModule.Map ? localModule : (localModule.default || localModule);
        return maplibreInstance;
      } catch (localErr) {
        console.warn('[HustMap] Local vendor import failed, trying bundled package fallback:', localErr);
      }
    }

    // 3. Ultimate Fallback: Package import from node_modules (for Vitest/JSDOM/SSR)
    try {
      const pkg = await import('maplibre-gl');
      maplibreInstance = pkg.Map ? pkg : (pkg.default || pkg);
      return maplibreInstance;
    } catch (pkgErr) {
      console.error('[HustMap] All MapLibre loaders failed:', pkgErr);
      throw pkgErr;
    }
  })();

  return loadPromise;
}

export default getMapLibre;
