import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  checkOfflineStatus,
  downloadAllForOffline,
  clearOfflineCache,
} from '../services/offlineManager.js';

describe('Offline Manager', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    delete window.caches;
  });

  describe('checkOfflineStatus', () => {
    it('returns supported: false when window.caches is undefined', async () => {
      delete window.caches;
      const status = await checkOfflineStatus();
      expect(status).toEqual({
        supported: false,
        isReady: false,
        cachedCount: 0,
        totalCount: 0,
      });
    });

    it('returns status with cache count when caches is available', async () => {
      const mockAssets = Array.from({ length: 10 }, (_, i) => `/asset${i}.png`);
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockAssets,
      });

      const mockCache = {
        keys: vi.fn().mockResolvedValue([]),
        match: vi.fn((url) => Promise.resolve(url === '/asset0.png' ? {} : null)),
      };

      window.caches = {
        open: vi.fn().mockResolvedValue(mockCache),
      };

      const status = await checkOfflineStatus();
      expect(status.supported).toBe(true);
      expect(status.cachedCount).toBe(1);
      expect(status.totalCount).toBe(10);
      expect(status.isReady).toBe(false); // 1 / 10 = 10% < 95%
    });
  });

  describe('downloadAllForOffline', () => {
    it('throws if caches API is unsupported', async () => {
      delete window.caches;
      await expect(downloadAllForOffline()).rejects.toThrow('Trình duyệt không hỗ trợ CacheStorage');
    });

    it('downloads assets and triggers onProgress callback', async () => {
      const mockAssets = ['/asset1.png', '/asset2.png'];
      const mockCache = {
        match: vi.fn().mockResolvedValue(null),
        put: vi.fn().mockResolvedValue(true),
      };

      window.caches = {
        open: vi.fn().mockResolvedValue(mockCache),
      };

      global.fetch = vi.fn((url) => {
        if (url === '/offline_assets.json') {
          return Promise.resolve({
            ok: true,
            json: async () => mockAssets,
          });
        }
        return Promise.resolve({ ok: true });
      });

      const progressUpdates = [];
      const result = await downloadAllForOffline((p) => progressUpdates.push(p));

      expect(result.success).toBe(true);
      expect(result.total).toBe(2);
      expect(progressUpdates.length).toBe(2);
      expect(progressUpdates[1].percentage).toBe(100);
      expect(mockCache.put).toHaveBeenCalledTimes(2);
    });
  });

  describe('clearOfflineCache', () => {
    it('returns false when caches is unsupported', async () => {
      delete window.caches;
      const res = await clearOfflineCache();
      expect(res).toBe(false);
    });

    it('calls caches.delete with cache name', async () => {
      window.caches = {
        delete: vi.fn().mockResolvedValue(true),
      };

      const res = await clearOfflineCache();
      expect(res).toBe(true);
      expect(window.caches.delete).toHaveBeenCalledWith('hustmap-offline-v1');
    });
  });
});
