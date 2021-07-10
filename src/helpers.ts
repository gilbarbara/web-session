import { Options } from './types';

export const defaultOptions: Options = {
  callback: () => undefined,
  duration: 30,
  historySize: 50,
  name: 'WebSessionData',
  timezone: 'UTC',
};

export function hasLocalStorage() {
  if (typeof window.isLocalStorageSupported === 'undefined') {
    const testKey = 'test';
    const storage = window.localStorage;

    try {
      storage.setItem(testKey, '1');
      storage.removeItem(testKey);
      window.isLocalStorageSupported = true;
    } catch {
      window.isLocalStorageSupported = false;
    }
  }

  return window.isLocalStorageSupported;
}

export function parseQuery(query: string) {
  return query
    .slice(1)
    .split('&')
    .map(d => {
      const [key, value] = d.split('=');

      return [key, value];
    });
}

export function shallowCompare(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export const storage = {
  get(name: string) {
    /* istanbul ignore else */
    if (hasLocalStorage()) {
      const item = window.localStorage.getItem(name);

      return item ? JSON.parse(item) : null;
    }

    return null;
  },
  set(name: string, data: unknown) {
    /* istanbul ignore else */
    if (hasLocalStorage()) {
      window.localStorage.setItem(name, JSON.stringify(data));
    }
  },
  remove(name: string) {
    /* istanbul ignore else */
    if (hasLocalStorage()) {
      window.localStorage.removeItem(name);
    }
  },
};
