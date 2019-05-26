import fs from 'fs';
import path from 'path';
import process from 'process';
import fse from 'fs-extra';

export const zipWith = <T1, T2, T3>(
  fn: (x: T1, y: T2) => {},
  xs: T1[],
  ys: T2[]
): T3[] => {
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

export const splitFilenameIntoWords = (() => {
  const memo: { [key: string]: string[] } = {};
  return (filename: string): string[] => {
    if (memo[filename]) {
      return memo[filename];
    }
    const result = filename.split(/[\s\-_@\.\(\)]/g).filter(x => x);
    memo[filename] = result;
    return result;
  };
})();

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
  filename: string;
};

type SimilarFiles = {
  [similarity: string]: string[];
};

const similarityRank = (head: string, rest: string[]): SimilarFiles => {
  return rest
    .map(filename => ({
      similarity: headSimilarity(head, filename),
      filename
    }))
    .reduce((accum: SimilarFiles, curr: Similarity) => {
      if (curr.similarity === 0) {
        return accum;
      }
      const similarFiles = accum[curr.similarity] || [];
      return {
        ...accum,
        [curr.similarity]: [curr.filename, ...similarFiles]
      };
    }, {});
};

const moveFilesIntoDir = (basedir: string, filesToMove: string[]) => {
  const newDirname = path.join(
    basedir,
    splitFilenameIntoWords(filesToMove[0])
      .slice(0, 3)
      .join(' ')
  );
  if (!fs.existsSync(newDirname)) {
    fs.mkdirSync(newDirname);
  }
  console.log('moving files into a directory: ', newDirname);

  filesToMove.forEach(x => {
    const source = path.join(basedir, x);
    if (!fs.existsSync(source)) {
      return;
    }
    if (source === newDirname) {
      return;
    }
    const dist = path.join(newDirname, x);
    fse.copySync(source, dist);
    fse.removeSync(source);
  });
};

const main = () => {
  // TODO thresold をオプション化する
  const threshold = 2;
  const dirName = path.resolve(process.argv[2] || './');
  const files = fs.readdirSync(dirName).filter(v => !v.startsWith('.'));
  let sortedFiles = files.sort();
  while (sortedFiles.length > 0) {
    const [head, ...rest] = sortedFiles;
    const ranking = similarityRank(head, rest);
    const maxSimilarity = Object.keys(ranking).reduce((max, curr) => {
      return Number(curr) > max ? Number(curr) : max;
    }, 0);
    if (maxSimilarity > threshold) {
      const filesToMove = [head, ...ranking[maxSimilarity]];
      moveFilesIntoDir(dirName, filesToMove);
      sortedFiles = sortedFiles.filter(x => !filesToMove.includes(x));
    } else {
      sortedFiles = sortedFiles.slice(1);
    }
  }
};

main();
