import { getAssetUrl } from '../utils/assetUrl.js';

const API_BASE = 'https://api.hustmap.com/api/v1';

export async function fetchBuildings() {
  try {
    const res = await fetch(`${API_BASE}/buildings`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Fallback to local buildings cache', err);
  }
  const local = await fetch(getAssetUrl('/buildings.json'));
  return await local.json();
}

export async function fetchParkings() {
  try {
    const res = await fetch(`${API_BASE}/parkings`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Fallback to local parkings cache', err);
  }
  const local = await fetch(getAssetUrl('/parkings.json'));
  return await local.json();
}

export async function fetchBuildingDetail(buildingId) {
  try {
    const res = await fetch(`${API_BASE}/buildings/${buildingId}`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.error('Fetch building detail error', err);
  }
  return null;
}

export async function fetchRooms(buildingId, floorNum = '', type = '') {
  try {
    const params = new URLSearchParams();
    if (floorNum && floorNum !== 100) params.append('floorNum', floorNum.toString());
    if (type && type !== 'all') params.append('type', type);
    params.append('offset', '0');

    const res = await fetch(`${API_BASE}/rooms/${buildingId}?${params.toString()}`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.error('Fetch rooms error', err);
  }
  return [];
}

export async function searchAndFind(query) {
  if (!query || !query.trim()) return [];
  try {
    const res = await fetch(`${API_BASE}/SnF/${encodeURIComponent(query.trim())}`);
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
  } catch (err) {
    console.error('Search error', err);
  }
  return [];
}

export async function fetchParkingDetail(parkingId) {
  try {
    const res = await fetch(`${API_BASE}/parkings/${parkingId}`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.error('Fetch parking detail error', err);
  }
  return null;
}

export async function submitFeedback(formData) {
  try {
    const res = await fetch(`${API_BASE}/feedback`, {
      method: 'POST',
      body: formData
    });
    return res.ok;
  } catch (err) {
    console.error('Submit feedback error', err);
    return false;
  }
}
