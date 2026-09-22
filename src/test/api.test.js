import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchBuildings,
  fetchParkings,
  fetchBuildingDetail,
  fetchRooms,
  searchAndFind,
  fetchParkingDetail,
  submitFeedback,
} from '../services/api.js';

describe('API Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchBuildings', () => {
    it('returns remote data when remote endpoint succeeds', () => {
      const mockBuildings = [{ id: 'B1', name: 'Building 1' }];
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockBuildings,
      });

      return fetchBuildings().then((data) => {
        expect(data).toEqual(mockBuildings);
        expect(global.fetch).toHaveBeenCalledWith('https://api.hustmap.com/api/v1/buildings');
      });
    });

    it('falls back to local /buildings.json when remote endpoint throws', async () => {
      const mockLocal = [{ id: 'B1_local', name: 'Local B1' }];
      global.fetch = vi
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockLocal,
        });

      const data = await fetchBuildings();
      expect(data).toEqual(mockLocal);
      expect(global.fetch).toHaveBeenNthCalledWith(1, 'https://api.hustmap.com/api/v1/buildings');
      expect(global.fetch).toHaveBeenNthCalledWith(2, '/buildings.json');
    });
  });

  describe('fetchParkings', () => {
    it('falls back to local /parkings.json when remote call fails', async () => {
      const mockParkings = [{ id: 'P1', name: 'Parking A' }];
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({ ok: false, status: 500 })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockParkings,
        });

      const data = await fetchParkings();
      expect(data).toEqual(mockParkings);
      expect(global.fetch).toHaveBeenLastCalledWith('/parkings.json');
    });
  });

  describe('fetchBuildingDetail', () => {
    it('fetches building detail by ID', async () => {
      const mockDetail = { id: 'D3', name: 'D3 Building', floors: 5 };
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockDetail,
      });

      const res = await fetchBuildingDetail('D3');
      expect(res).toEqual(mockDetail);
      expect(global.fetch).toHaveBeenCalledWith('https://api.hustmap.com/api/v1/buildings/D3');
    });

    it('returns null on failure', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Failed'));
      const res = await fetchBuildingDetail('invalid');
      expect(res).toBeNull();
    });
  });

  describe('fetchParkingDetail', () => {
    it('fetches parking detail by ID', async () => {
      const mockParking = { id: 'P1', name: 'Parking C1', capacity: 100 };
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockParking,
      });

      const res = await fetchParkingDetail('P1');
      expect(res).toEqual(mockParking);
      expect(global.fetch).toHaveBeenCalledWith('https://api.hustmap.com/api/v1/parkings/P1');
    });

    it('returns null on failure', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Failed'));
      const res = await fetchParkingDetail('invalid');
      expect(res).toBeNull();
    });
  });

  describe('fetchRooms', () => {
    it('appends query params correctly when filters are provided', async () => {
      const mockRooms = [{ id: 'R101', name: 'Room 101' }];
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockRooms,
      });

      const res = await fetchRooms('D3', 3, 'classroom');
      expect(res).toEqual(mockRooms);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.hustmap.com/api/v1/rooms/D3?floorNum=3&type=classroom&offset=0'
      );
    });

    it('omits floorNum=100 (all floors) and type="all"', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      await fetchRooms('D3', 100, 'all');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.hustmap.com/api/v1/rooms/D3?offset=0'
      );
    });
  });

  describe('searchAndFind', () => {
    it('returns empty array when query is empty or whitespace', async () => {
      const res1 = await searchAndFind('');
      const res2 = await searchAndFind('   ');
      expect(res1).toEqual([]);
      expect(res2).toEqual([]);
    });

    it('encodes query string and returns array of results', async () => {
      const mockResults = [{ id: '1', title: 'Library' }];
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults,
      });

      const res = await searchAndFind('Thư viện');
      expect(res).toEqual(mockResults);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.hustmap.com/api/v1/SnF/Th%C6%B0%20vi%E1%BB%87n'
      );
    });
  });

  describe('submitFeedback', () => {
    it('posts formData and returns true on success', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({ ok: true });
      const formData = new FormData();
      formData.append('type', 'bug');

      const success = await submitFeedback(formData);
      expect(success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith('https://api.hustmap.com/api/v1/feedback', {
        method: 'POST',
        body: formData,
      });
    });

    it('returns false when request errors', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network drop'));
      const success = await submitFeedback(new FormData());
      expect(success).toBe(false);
    });
  });
});
