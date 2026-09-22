import '@testing-library/jest-dom/vitest';

// Mock ResizeObserver if not present in jsdom
if (typeof window !== 'undefined' && !window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// Mock URL.createObjectURL and revokeObjectURL
if (typeof window !== 'undefined' && !window.URL.createObjectURL) {
  window.URL.createObjectURL = () => 'blob:mock-url';
  window.URL.revokeObjectURL = () => {};
}

// Mock matchMedia
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
