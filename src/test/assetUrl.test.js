import { describe, it, expect } from 'vitest';
import { getAssetUrl } from '../utils/assetUrl.js';

describe('getAssetUrl', () => {
  it('returns empty string if falsy input', () => {
    expect(getAssetUrl('')).toBe('');
    expect(getAssetUrl(null)).toBe('');
  });

  it('leaves full external URLs unchanged', () => {
    expect(getAssetUrl('https://api.hustmap.com/data')).toBe('https://api.hustmap.com/data');
    expect(getAssetUrl('http://example.com/test.png')).toBe('http://example.com/test.png');
    expect(getAssetUrl('data:image/png;base64,...')).toBe('data:image/png;base64,...');
    expect(getAssetUrl('blob:http://localhost/123')).toBe('blob:http://localhost/123');
  });

  it('prepends base url to relative paths', () => {
    const url = getAssetUrl('/icon/search.svg');
    expect(url.endsWith('icon/search.svg')).toBe(true);
  });
});
