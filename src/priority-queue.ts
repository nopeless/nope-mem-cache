type Comparator<T> = (a: T, b: T) => boolean;

function defaultComparator(a, b) {
  return a < b;
}

class PriorityQueue<T> {
  public array: T[] = [];
  public size = 0;
  constructor(public comparator: Comparator<T> = defaultComparator) {}

  clone(): PriorityQueue<T> {
    const pq = new PriorityQueue(this.comparator);
    pq.size = this.size;
    pq.array = this.array.slice();
    return pq;
  }

  add(val: T) {
    let idx = this.size;
    this.array[idx] = val;
    this.size++;
    let item: T, pointer: number;
    while (idx > 0) {
      pointer = (idx - 1) >> 1;
      item = this.array[pointer];
      if (!this.comparator(val, item)) {
        break;
      }
      this.array[idx] = item;
      idx = pointer;
    }
    this.array[idx] = val;
  }

  heapify(arr: T[]) {
    this.array = arr;
    this.size = arr.length;
    for (let i = this.size >> 1; i >= 0; i--) {
      this.sink(i);
    }
  }

  sink(idx: number) {
    const size = this.size;
    const hsize = this.size >>> 1;
    const ai = this.array[idx];
    let l: number, r: number, bestc: T;
    while (idx < hsize) {
      l = (idx << 1) + 1;
      r = l + 1;
      bestc = this.array[l];
      if (r < size) {
        if (this.comparator(this.array[r], bestc)) {
          l = r;
          bestc = this.array[r];
        }
      }
      if (!this.comparator(bestc, ai)) {
        break;
      }
      this.array[idx] = bestc;
      idx = l;
    }
    this.array[idx] = ai;
  }

  private percolateUpForce(idx: number) {
    const target = this.array[idx];

    let pointer, item;
    while (idx > 0) {
      pointer = (idx - 1) >> 1;
      item = this.array[pointer];
      this.array[idx] = item;
      idx = pointer;
    }
    this.array[idx] = target;
  }

  remove(item: T) {
    for (let i = 0; i < this.size; i++) {
      if (this.array[i] === item) {
        this.removeAt(i);
        return true;
      }
    }
    return false;
  }

  removeAt(idx: number) {
    if (idx > this.size - 1 || idx < 0) return;
    this.percolateUpForce(idx);
    return this.poll();
  }

  removeOne(cb: (item: T) => boolean): T | undefined {
    for (let i = 0; i < this.size; i++) {
      if (cb(this.array[i])) {
        return this.removeAt(i);
      }
    }
  }

  // https://github.com/lemire/FastPriorityQueue.js/blob/7b70143f3c826288bd1aeeb2b13484374e003b52/FastPriorityQueue.js#L173
  removeMany(cb: (item: T) => boolean, limit = Infinity) {
    if (this.size === 0) {
      return [];
    }

    limit = limit > this.size ? this.size : limit;

    let resultSize = 0;
    const result: T[] = new Array(limit);

    let tempSize = 0;
    const temp: T[] = new Array(this.size);

    let item: T;

    while (resultSize < limit && this.size) {
      item = this.poll() as T;
      if (cb(item)) {
        result[resultSize++] = item;
      } else {
        temp[tempSize++] = item;
      }
    }

    result.length = resultSize;

    for (let i = 0; i < tempSize; i++) {
      this.add(temp[i]);
    }

    return result;
  }

  peek(): T | undefined {
    if (this.size === 0) return;
    return this.array[0];
  }

  poll(): T | undefined {
    if (this.size === 0) return;
    const res = this.array[0];
    if (this.size > 1) {
      this.array[0] = this.array[this.size - 1];
      this.sink(0);
    }
    this.size--;
    return res;
  }

  clear() {
    this.array = [];
    this.size = 0;
  }

  replaceTop(item: T) {
    if (this.size === 0) return;
    const res = this.array[0];
    this.array[0] = item;
    this.sink(0);
    return res;
  }

  trim() {
    this.array = this.array.slice(0, this.size);
  }

  forEach(cb: (item: T, idx: number) => void) {
    if (this.size === 0) return;
    const pq = this.clone();
    for (let i = 0; pq.size; i++) {
      cb(pq.poll() as T, i);
    }
  }
}

export { PriorityQueue, defaultComparator };
export type { Comparator };
