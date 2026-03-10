// Web-specific polyfills and configurations
if (typeof window !== 'undefined') {
  // Polyfill for crypto if needed
  if (!window.crypto) {
    window.crypto = window.crypto || {};
  }
  
  // Ensure localStorage is available
  if (!window.localStorage) {
    window.localStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      length: 0,
      key: () => null,
    };
  }
}