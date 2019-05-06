import fs from 'fs';
import path from 'path';

export const zipWith = <T1, T2, T3>(
  fn: (x: T1, y: T2) => {},
  xs: T1[],
  ys: T2[]
): T3[] => {
  console.log(xs, ys);
  return xs
    .map((v, i) => {
      if (ys[i]) {
        return fn(v, ys[i]);
      }
      return null;
    })
    .filter(v => v !== null) as T3[];
};

export const takeUntil = <T>(predicate: Function, xs: T[]): T[] => {
  let result = [];
  for (let i = 0; i < xs.length; i++) {
    const trueOrFalse = predicate(xs[i]);
    if (!trueOrFalse) {
      break;
    }
    result.push(trueOrFalse);
  }
  return result;
};

export const reverseString = (x: string): string => {
  let reversed = '';
  for (let i = x.length - 1; i >= 0; i--) {
    reversed += x[i];
  }
  return reversed;
};

export const sum = (xs: number[]): number => {
  return xs.reduce((accum, curr) => accum + curr, 0);
};

export const withoutExt = (x: string): string =>
  x.replace(/\.[a-zA-Z0-9]*$/, '');

export const splitFilenameIntoWords = (filename: string): string[] => {
  return filename.split(/[\s-@\.]/g).filter(x => x);
};

export const calcSimilarity = (
  filename: string,
  otherFilename: string
): number[] => {
  return zipWith(
    (x, y) => (x === y ? 1 : 0),
    splitFilenameIntoWords(filename),
    splitFilenameIntoWords(otherFilename)
  );
};

export const headSimilarity = (x: string, y: string): number => {
  return sum(takeUntil((v: number): boolean => v === 1, calcSimilarity(x, y)));
};

export const tailSimilarity = (x: string, y: string): number => {
  return sum(
    takeUntil(
      (v: number): boolean => v === 1,
      // TODO revserseしたあとで拡張子を取り除く
      calcSimilarity(reverseString(withoutExt(x)), reverseString(withoutExt(y)))
    )
  );
};

export const similarity = (x: string, y: string): number => {
  return sum(calcSimilarity(x, y));
};

type Similarity = {
  similarity: number;
  members: string[];
};

const similarityRank = (files: string[]): Similarity[] => {
  const sortedFiles = files.sort();

  const recursive = (
    ranking: Similarity[],
    [head, ...tail]: string[]
  ): Similarity[] => {
    if (!head) {
      return ranking;
    }

    const highestSimilarFiles = tail.reduce(
      (accum: Similarity, curr: string): Similarity => {
        const similarity = headSimilarity(head, curr);
        if (similarity === 0) {
          return accum;
        }

        if (accum.similarity > similarity) {
          return accum;
        }

        return { similarity, members: [...accum.members, curr] };
      },
      { similarity: 0, members: [head] }
    );

    // console.log(
    // '********* highe',
    // highestSimilarFiles.similarity,
    // highestSimilarFiles.members.length
    // );
    return recursive([...ranking, highestSimilarFiles], tail);
  };

  return recursive([], sortedFiles);
};

const zip = (filename: string) => {};

const main = () => {
  const dirName = path.resolve(process.argv[2] || './');
  const files = fs.readdirSync(dirName).filter(v => !v.startsWith('.'));
  const ranking = similarityRank(files);
  console.log('********* ranking', ranking);
};

main();
