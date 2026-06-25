export function getInitialData() {
  if (typeof window !== "undefined" && window.__INITIAL_DATA__) {
    return window.__INITIAL_DATA__;
  }

  if (typeof globalThis !== "undefined" && globalThis.__INITIAL_DATA__) {
    return globalThis.__INITIAL_DATA__;
  }

  return {};
}
