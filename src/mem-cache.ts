import { PriorityQueue } from "./priority-queue.js";

class MemoryCache<T> {
  public ttl: number;
  private pq = new PriorityQueue<TimedItem<T>>();
  public cache = new Map<string, T>();
  constructor({ ttl = -1 }: { ttl?: number } = {}) {
    this.ttl = ttl;
  }

  // get(idx: string): T | null {
  //   const item = this.cache.get(idx);
  //   if (item) {
  //     this.pq.removeOne((v) => v.value === item);
  //     return item;
  //   }
  //   return null;
  // }

  add(key: string, value: T) {}
}

class TimedItem<T> {
  constructor(public ttl: number, public value: T) {}
}

function MemoryCacheProxy<T>() {
  return new Proxy(Object.create(null), {});
}

export { MemoryCache, MemoryCacheProxy };
