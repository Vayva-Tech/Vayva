import {
  arrayToDict,
  groupBy,
  deepClone,
  pick,
  omit,
  flatten,
  chunk,
  unique,
  sortBy,
  mapKeys,
} from '../utils/data-transformers';

describe('data-transformers utilities', () => {
  describe('arrayToDict', () => {
    it('should convert array to dictionary', () => {
      const users = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ];
      
      const dict = arrayToDict(users, user => user.id.toString());
      expect(dict).toEqual({
        '1': { id: 1, name: 'Alice' },
        '2': { id: 2, name: 'Bob' },
      });
    });
  });

  describe('groupBy', () => {
    it('should group array by key', () => {
      const items = [
        { category: 'A', value: 1 },
        { category: 'B', value: 2 },
        { category: 'A', value: 3 },
      ];
      
      const grouped = groupBy(items, item => item.category);
      expect(grouped).toEqual({
        A: [
          { category: 'A', value: 1 },
          { category: 'A', value: 3 },
        ],
        B: [
          { category: 'B', value: 2 },
        ],
      });
    });
  });

  describe('deepClone', () => {
    it('should deep clone object', () => {
      const original = {
        a: 1,
        b: { c: 2 },
        d: [3, 4],
      };
      
      const cloned = deepClone(original);
      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.b).not.toBe(original.b);
      expect(cloned.d).not.toBe(original.d);
    });

    it('should handle dates', () => {
      const date = new Date();
      const cloned = deepClone(date);
      expect(cloned).toEqual(date);
      expect(cloned).not.toBe(date);
    });
  });

  describe('pick', () => {
    it('should pick specific keys', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const picked = pick(obj, ['a', 'c']);
      expect(picked).toEqual({ a: 1, c: 3 });
    });
  });

  describe('omit', () => {
    it('should omit specific keys', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const omitted = omit(obj, ['b']);
      expect(omitted).toEqual({ a: 1, c: 3 });
    });
  });

  describe('flatten', () => {
    it('should flatten nested arrays', () => {
      const nested = [[1, 2], [3, 4], [5]];
      expect(flatten(nested)).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe('chunk', () => {
    it('should chunk array into smaller arrays', () => {
      const array = [1, 2, 3, 4, 5, 6];
      expect(chunk(array, 2)).toEqual([[1, 2], [3, 4], [5, 6]]);
    });

    it('should handle remainder', () => {
      const array = [1, 2, 3, 4, 5];
      expect(chunk(array, 2)).toEqual([[1, 2], [3, 4], [5]]);
    });
  });

  describe('unique', () => {
    it('should remove duplicates', () => {
      const array = [1, 2, 2, 3, 3, 4];
      expect(unique(array)).toEqual([1, 2, 3, 4]);
    });

    it('should remove duplicates by key function', () => {
      const array = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 1, name: 'Alice2' },
      ];
      expect(unique(array, item => item.id.toString())).toEqual([
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ]);
    });
  });

  describe('sortBy', () => {
    it('should sort by single criterion', () => {
      const array = [{ name: 'Charlie' }, { name: 'Alice' }, { name: 'Bob' }];
      const sorted = sortBy(array, item => item.name);
      expect(sorted.map(item => item.name)).toEqual(['Alice', 'Bob', 'Charlie']);
    });

    it('should sort by multiple criteria', () => {
      const array = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
        { name: 'Alice', age: 25 },
      ];
      const sorted = sortBy(array, item => item.name, item => item.age);
      expect(sorted).toEqual([
        { name: 'Alice', age: 25 },
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
      ]);
    });
  });

  describe('mapKeys', () => {
    it('should transform object keys', () => {
      const obj = { firstName: 'John', lastName: 'Doe' };
      const mapped = mapKeys(obj, key => key.toUpperCase());
      expect(mapped).toEqual({ FIRSTNAME: 'John', LASTNAME: 'Doe' });
    });
  });
});