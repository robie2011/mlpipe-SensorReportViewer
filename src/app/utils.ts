
export function getArrayIndexes<T>(arr: Array<T>) {
    return arr.map((v, ix) => ix)
  }
  
  
export function flatMap<T,U>(arr: Array<T>, cb: (x: T) => Array<U>): Array<U>{
    let result = []
    arr.map(x => cb(x))
    .forEach(xs => result.push(...xs))
    return result
  }
  