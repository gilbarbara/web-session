import {
  hasLocalStorage,
  parseQuery,
  shallowCompare,
  storage,
} from '../src/utils';

describe('utils', () => {
  describe('hasLocalStorage', () => {
    it('should return true if there\'s a working localStorage', () => {
      expect(hasLocalStorage()).toBe(true);
    });

    it('should fail otherwise', () => {
      window.isLocalStorageSupported = false;
      expect(hasLocalStorage()).toBe(false);
    });
  });

  describe('parseQuery', () => {
    it('should parse some query strings', () => {
      expect(parseQuery('?utm_source=abc&utm_campaign=flower'))
        .toEqual([
          ['utm_source', 'abc'],
          ['utm_campaign', 'flower'],
        ]);

      expect(parseQuery('?color=green&size=lg'))
        .toEqual([
          ['color', 'green'],
          ['size', 'lg'],
        ]);
    });
  });

  describe('shallowCompare', () => {
    it('should compare objects', () => {
      expect(shallowCompare({}, {}))
        .toBe(true);

      expect(shallowCompare({ name: 'AB', items: [{ a: 1 }] }, { name: 'AB', items: [{ a: 1 }] }))
        .toBe(true);

      expect(shallowCompare({ a: 1 }, {}))
        .toBe(false);

      expect(shallowCompare({}, { b: 2 }))
        .toBe(false);
    });

    it('should compare arrays', () => {
      expect(shallowCompare([], []))
        .toBe(true);

      expect(shallowCompare([0, { a: 1 }], [0, { a: 1 }]))
        .toBe(true);

      expect(shallowCompare([0, { a: 1 }], [0, { b: 1 }]))
        .toBe(false);
    });

    it('should compare strings / numbers', () => {
      expect(shallowCompare('abc', 'abc'))
        .toBe(true);
    });

    expect(shallowCompare(0, 0))
      .toBe(true);

    expect(shallowCompare(0, '0'))
      .toBe(false);
  });

  describe('storage', () => {
    describe('with localStorage', () => {
      beforeAll(() => {
        window.isLocalStorageSupported = true;
      });

      it('should return null if there\'s no saved data', () => {
        expect(storage.get('NEW')).toBe(null);
      });

      it('should save data', () => {
        storage.set('NEW', { a: 1 });
        expect(storage.get('NEW')).toEqual({ a: 1 });
      });

      it('should remove data', () => {
        storage.remove('NEW');
        expect(storage.get('NEW')).toEqual(null);
      });
    });

    describe('without localStorage', () => {
      beforeAll(() => {
        window.isLocalStorageSupported = false;
      });

      it('should return null', () => {
        expect(storage.get('NEW')).toBe(null);
      });

      it('should return null', () => {
        storage.set('NEW', {});

        expect(storage.get('NEW')).toBe(null);
      });
    });
  });
});
