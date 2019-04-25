import fs from 'fs';
import path from 'path';

export const zipWith = <T1, T2, T3>(fn: (x: T1, y: T2) => {}, xs: T1[], ys: T2[]): T3[] => {
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

export const withoutExt = (x: string): string => x.replace(/\.[a-zA-Z0-9]*$/, '');

export const calcSimilarity = (filename: string, otherFilename: string): number[] => {
  const filenameChars = filename.split('');
  const otherFilenameChars = otherFilename.split('');
  return zipWith((x, y) => (x === y ? 1 : 0), filenameChars, otherFilenameChars);
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

type SimilarityMap = Map<number, string[]>;

// 類似度をキーとしたオブジェクトを返す
const calcSimilarities = (filename: string, otherFilenames: string[]): SimilarityMap => {
  return otherFilenames.reduce((accum: Map<number, string[]>, curr: string) => {
    const similarity = headSimilarity(filename, curr);
    if (accum.has(similarity)) {
      const temp = accum.get(similarity) || [];
      return accum.set(similarity, [...temp, curr]);
    }
    return accum.set(similarity, [curr]);
  }, new Map());
};

type SimilarityRanking = {
  [similarity: number]: string[];
};

const groupAndPack = (
  accum: SimilarityRanking,
  index: number,
  files: string[]
): SimilarityRanking => {
  // 各ファイルに対して、一番類似度の高いファイル名だけを求める
  // 類似スコア最高のものをzip化してリストから削除

  const file = files[index];
  console.log('********* file', file);
  const otherFiles = [...files.slice(0, index), ...files.slice(index + 1)];
  if (index > files.length) {
    return accum;
  }

  // ある一つのファイルに対して他のファイルの類似度を計算
  const result = calcSimilarities(file, otherFiles);

  // 最高類似スコアを計算
  let maxSimilarity = 0;
  for (const similarity of result.keys()) {
    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
    }
  }
  console.log('********* maxSimilarity', maxSimilarity);
  // 最高類似スコアが5未満のとき、類似ファイルなしとみなす
  if (maxSimilarity < 5) {
    return groupAndPack(accum, index + 1, files);
  }

  //  類似スコアの高いものをひとまとめにしてかえす
  let highlySimilarFiles: string[] = [file];
  for (const [similarity, filenames] of result.entries()) {
    // 一番高い類似スコアと、その90％以上のスコアものだけを残す
    if (similarity > maxSimilarity * 0.8) {
      highlySimilarFiles = [...highlySimilarFiles, ...filenames];
    }
  }

  console.log('********* accum', accum);
  return groupAndPack({ ...accum, [maxSimilarity]: highlySimilarFiles }, index + 1, files);
};

const zip = (filename: string) => {};

const main = () => {
  const dirName = path.resolve(process.argv[2] || './');
  const files = fs.readdirSync(dirName).filter(v => !v.startsWith('.'));
  const ranking = groupAndPack([], 0, files);
  console.log('********* ranking', ranking);
};

main();
