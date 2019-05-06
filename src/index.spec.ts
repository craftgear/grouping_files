import {
  calcSimilarity,
  zipWith,
  takeUntil,
  reverseString,
  sum,
  splitFilenameIntoWords,
  headSimilarity,
  tailSimilarity,
  similarity
} from './index';

describe('grouping_files', () => {
  it('calcSimilarity', () => {
    expect(calcSimilarity('aaa', 'bbb-ccc')).toEqual([0]);
    expect(calcSimilarity('aaa', 'aaa - aaa bbaccc')).toEqual([1]);
    expect(calcSimilarity('aaa bbb', 'aaa - bbb@ccc')).toEqual([1, 1]);
    expect(calcSimilarity('ccc@bbb', 'ccc aaa aaa')).toEqual([1, 0]);
    expect(calcSimilarity('aaa', 'aaaccc')).toEqual([0]);
  });

  it('zipWith', function() {
    expect(zipWith((x, y) => x + y, [1, 2, 3], [3, 2, 1])).toEqual([4, 4, 4]);
  });

  it('takeUntil', function() {
    expect(takeUntil(v => v === true, [true, true, false, true])).toEqual([
      true,
      true
    ]);
  });

  it('reverseString', function() {
    expect(reverseString('hoge')).toEqual('egoh');
  });

  it('sum', function() {
    expect(sum([1, 2, 3, 4, 5])).toEqual(15);
  });

  it('splitFilenameIntoWords', () => {
    expect(splitFilenameIntoWords('aaa - bbb')).toEqual(['aaa', 'bbb']);
  });

  it('headSimilarity', function() {
    expect(
      headSimilarity('aaa - bbb - cccc.md', 'aaa - bbb -xx cc yyyy@cc.txt')
    ).toEqual(2);
  });

  it('tailSimilarity', function() {
    expect(
      tailSimilarity('aaa - bbb - cc.md', 'aaa - b -xx cc yyyy@cc.txt')
    ).toEqual(1);
  });

  it('similarity', function() {
    expect(
      similarity('aaa - bbb - xx cc.md', 'aaa - b - xx cc yyyy@cc.txt')
    ).toEqual(3);
  });
});
