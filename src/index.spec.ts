import {
  calcSimilarity,
  zipWith,
  takeUntil,
  reverseString,
  sum,
  headSimilarity,
  tailSimilarity,
  similarity,
} from './index';

describe('grouping_files', () => {
  it('calcSimilarity', () => {
    expect(calcSimilarity('aaa', 'bbbccc')).toEqual([0, 0, 0]);
    expect(calcSimilarity('aaa', 'abbccc')).toEqual([1, 0, 0]);
    expect(calcSimilarity('aaa', 'bbaccc')).toEqual([0, 0, 1]);
    expect(calcSimilarity('aaa', 'babccc')).toEqual([0, 1, 0]);
    expect(calcSimilarity('aaa', 'aaaccc')).toEqual([1, 1, 1]);
  });

  it('zipWith', function() {
    expect(zipWith((x, y) => x + y, [1, 2, 3], [3, 2, 1])).toEqual([4, 4, 4]);
  });

  it('takeUntil', function() {
    expect(takeUntil(v => v === true, [true, true, false, true])).toEqual([true, true]);
  });

  it('reverseString', function() {
    expect(reverseString('hoge')).toEqual('egoh');
  });

  it('sum', function() {
    expect(sum([1, 2, 3, 4, 5])).toEqual(15);
  });

  it('headSimilarity', function() {
    expect(headSimilarity('aaabbbcccc.md', 'aaabxxccyyyyyycc.txt')).toEqual(4);
  });

  it('tailSimilarity', function() {
    expect(tailSimilarity('aaabbbcccc.md', 'aaabxxccyyyycc.txt')).toEqual(2);
  });

  it('similarity', function() {
    expect(similarity('aaabbbcccc.md', 'aaabxxccyyyycc.txt')).toEqual(6);
  });
});
