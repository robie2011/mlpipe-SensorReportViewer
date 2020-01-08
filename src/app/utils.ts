
import { Observable, from } from 'rxjs'

export function getArrayIndexes<T>(arr: Array<T>) {
    return arr.map((v, ix) => ix)
  }
  
  
export function flatMap<T,U>(arr: Array<T>, cb: (x: T) => Array<U>): Array<U>{
    let result = []
    arr.map(x => cb(x))
    .forEach(xs => result.push(...xs))
    return result
  }
  

export type KeyValuelistMap = {[index: number]: number[]}
export class KeyValueCache {
  private cache = {}

  private add = (key: number, value: any) => {
    this.cache[key] = value
  }

  private getAll = () : KeyValuelistMap => {
    return Object.keys(this.cache).map(k => this.cache[k])
  }

  reset = () => this.cache = {}

  cacheAndReturn = (key: number, value: any): KeyValuelistMap => {
    this.add(key, value)
    return this.getAll()
  }
}
