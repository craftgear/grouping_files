import fs from 'fs';
import path from 'path';

const calcSimilarlity = (filename: string, otherFilename: string): number => {
  console.log('********* filename, otherFilename', filename, otherFilename);
  const filenameChars = filename.split('')
  const otherFilenameChars = otherFilename.split('')
  const similarity = filenameChars.reduce(( accum: number, char: string, i:number ) => {
    console.log('********* char', char);
    console.log('********* other', otherFilenameChars[i]);
    if (i > otherFilenameChars.length) {
      return accum
    }
    if (char === otherFilenameChars[i]) {
      return accum + 1
    }
    return accum
  }, 0)
  console.log('********* similarity', similarity);
  return  similarity;
}

const oneAgainstOthers = (filename: string, otherFilenames: string[]): Map<number, string[]> => {
    return otherFilenames.reduce((accum: Map<number, string[]>, curr: string) => {
      const similarity = calcSimilarlity(filename, curr)
      if (accum.has(similarity)) {
        const temp = accum.get(similarity) || [];
        return accum.set(similarity, [...temp, curr])
      }
      return accum.set(similarity, [curr])
    }, new Map())
}

const ls = () => {
  const  dirName=  path.resolve(process.argv[2] || './')
  const files = fs.readdirSync('./')
  const similarities = oneAgainstOthers(files[0], files.slice(1));
  console.log('********* similarities', similarities);
}


ls()
