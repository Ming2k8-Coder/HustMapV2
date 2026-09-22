import { getAssetUrl } from '../utils/assetUrl.js';

/**
 * HustMap Offline Manager
 * Tải và lưu trữ toàn bộ bản đồ về máy thiết bị (CacheStorage) tương tự Google Drive/Docs Offline.
 */

const CACHE_NAME = 'hustmap-offline-v1';

export async function checkOfflineStatus() {
  if (!('caches' in window)) {
    return { supported: false, isReady: false, cachedCount: 0, totalCount: 0 };
  }

  try {
    const res = await fetch(getAssetUrl('/offline_assets.json'));
    if (!res.ok) return { supported: true, isReady: false, cachedCount: 0, totalCount: 0 };
    const assets = await res.json();
    const totalCount = assets.length;

    const cache = await caches.open(CACHE_NAME);
    
    // Đếm số lượng asset trong offline_assets đã có trong cache
    let cachedCount = 0;
    for (const asset of assets) {
      const match = await cache.match(getAssetUrl(asset));
      if (match) cachedCount++;
    }

    const isReady = cachedCount >= Math.floor(totalCount * 0.95); // >= 95% coi như sẵn sàng offline
    return { supported: true, isReady, cachedCount, totalCount };
  } catch (err) {
    console.error('Lỗi kiểm tra offline status:', err);
    return { supported: true, isReady: false, cachedCount: 0, totalCount: 0 };
  }
}

export async function downloadAllForOffline(onProgress) {
  if (!('caches' in window)) {
    throw new Error('Trình duyệt không hỗ trợ CacheStorage / Service Worker.');
  }

  const res = await fetch(getAssetUrl('/offline_assets.json'));
  if (!res.ok) throw new Error('Không thể tải danh sách tài nguyên offline_assets.json');
  const assets = await res.json();
  const total = assets.length;

  const cache = await caches.open(CACHE_NAME);
  let completed = 0;

  // Tải đồng thời với Concurrency Pool = 6 để tối ưu tốc độ và không nghẽn mạng
  const CONCURRENCY = 6;
  let index = 0;

  async function worker() {
    while (index < assets.length) {
      const currentIndex = index++;
      const rawUrl = assets[currentIndex];
      const targetUrl = getAssetUrl(rawUrl);
      try {
        const match = await cache.match(targetUrl);
        if (!match) {
          const fetchRes = await fetch(targetUrl, { cache: 'no-cache' });
          if (fetchRes && fetchRes.ok) {
            await cache.put(targetUrl, fetchRes);
          }
        }
      } catch (e) {
        console.warn('Lỗi tải asset ngoại tuyến:', targetUrl, e);
      } finally {
        completed++;
        if (onProgress) {
          onProgress({
            completed,
            total,
            percentage: Math.min(100, Math.round((completed / total) * 100)),
            currentUrl: targetUrl
          });
        }
      }
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  return { success: true, total };
}

export async function clearOfflineCache() {
  if (!('caches' in window)) return false;
  const deleted = await caches.delete(CACHE_NAME);
  return deleted;
}
