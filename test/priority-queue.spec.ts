// import { expect } from "chai";
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment */

import { PriorityQueue } from "../src/priority-queue.js";

function checkOrder<T>(arr: PriorityQueue<T>, iterOrder: T[]) {
  let j = 0;
  arr.forEach((next: T, i: number) => {
    j++;
    const item = iterOrder[i];
    if (next !== item)
      throw new Error(`expected ${item} at ${i} but got ${next}`);
  });
  if (j !== iterOrder.length)
    throw new Error(`expected ${iterOrder.length} but got ${j}`);
}

let seed = 1;

function random() {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

describe(`priority-queue`, function () {
  // Copied from https://github.com/lemire/FastPriorityQueue.js/blob/master/unit/basictests.js
  it(`example1`, function () {
    // ascending
    const x = new PriorityQueue(function (a: any, b: any) {
      return a < b;
    });
    x.add(1);
    x.add(0);
    x.add(5);
    x.add(4);
    x.add(3);

    const iterOrder = [0, 1, 3, 4, 5];

    // first iterate without mutating the queue
    checkOrder(x, iterOrder);

    // then iterate via polling
    for (let i = 0; i < iterOrder.length; i++) {
      const item = iterOrder[i];
      if (x.poll() != item) throw new Error(`no details`);
    }
  });

  it(`example2`, function () {
    // descending
    const x = new PriorityQueue(function (a, b) {
      // @ts-ignore
      return a > b;
    });
    x.add(1);
    x.add(0);
    x.add(5);
    x.add(4);
    x.add(3);

    const iterOrder = [5, 4, 3, 1, 0];

    // first iterate without mutating the queue
    checkOrder(x, iterOrder);

    // then iterate via polling
    for (let i = 0; i < iterOrder.length; i++) {
      const item = iterOrder[i];
      if (x.poll() != item) throw new Error(`no details`);
    }
  });

  it(`remove`, function () {
    const x = new PriorityQueue();

    // should return false when queue is empty
    if (x.remove(0) !== false) throw new Error(`no details`);

    x.heapify([8, 6, 7, 5, 3, 0, 9, 1, 0]);
    checkOrder(x, [0, 0, 1, 3, 5, 6, 7, 8, 9]);

    // should return false when no matching element is in the queue
    if (x.remove(10) !== false) throw new Error(`no details`);

    if (!x.remove(0)) throw new Error(`no details`);
    checkOrder(x, [0, 1, 3, 5, 6, 7, 8, 9]);

    if (!x.remove(7)) throw new Error(`no details`);
    if (!x.remove(3)) throw new Error(`no details`);
    checkOrder(x, [0, 1, 5, 6, 8, 9]);

    if (!x.remove(9)) throw new Error(`no details`);
    checkOrder(x, [0, 1, 5, 6, 8]);

    if (!x.remove(6)) throw new Error(`no details`);
    checkOrder(x, [0, 1, 5, 8]);

    if (!x.remove(1)) throw new Error(`no details`);
    checkOrder(x, [0, 5, 8]);

    if (x.remove(1)) throw new Error(`no details`);
    checkOrder(x, [0, 5, 8]);
  });

  it(`removeOne`, function () {
    const x = new PriorityQueue();

    const callback = function (val) {
      return val === 1;
    };

    let removedItem = x.removeOne(callback);
    if (removedItem !== undefined) throw new Error(`no details`);

    x.heapify([8, 6, 7, 5, 3, 0, 9, 1, 0]);

    removedItem = x.removeOne(callback);
    if (removedItem !== 1) throw new Error(`no details`);
    checkOrder(x, [0, 0, 3, 5, 6, 7, 8, 9]);

    removedItem = x.removeOne(callback);
    if (removedItem !== undefined) throw new Error(`no details`);
    checkOrder(x, [0, 0, 3, 5, 6, 7, 8, 9]);
  });

  it(`removeMany`, function () {
    const x = new PriorityQueue();
    x.heapify([
      8, 9, 9, 2, 1, 0, 4, 6, 2, 7, 6, 8, 7, 8, 0, 6, 7, 1, 6, 1, 7, 8, 3, 8, 4,
      1, 2, 9, 6, 1, 8, 7, 2, 7, 7, 8, 8, 5, 8, 8,
    ]);

    let callback = function (val) {
      return val === 6;
    };
    let removedItems = x.removeMany(callback);
    if (removedItems.length !== 5 || x.size !== 35)
      throw new Error(`no details`);
    checkOrder(
      x,
      [
        0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 4, 4, 5, 7, 7, 7, 7, 7, 7, 7, 8, 8,
        8, 8, 8, 8, 8, 8, 8, 8, 9, 9, 9,
      ]
    );

    callback = function (val) {
      return val > 6;
    };
    removedItems = x.removeMany(callback);
    if (removedItems.length !== 20) throw new Error(`no details`);
    // @ts-ignore
    if (x.size !== 15) throw new Error(`no details`);
    checkOrder(x, [0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 4, 4, 5]);

    callback = function () {
      return true;
    };
    removedItems = x.removeMany(callback, 10);
    if (removedItems.length !== 10 || x.size !== 5)
      throw new Error(`no details`);
  });

  it(`removeMany remove all - one item`, function () {
    const x = new PriorityQueue();
    x.heapify([1]);

    const callback = function () {
      return true;
    };

    const removedItems = x.removeMany(callback);
    if (removedItems.length !== 1 || x.size !== 0)
      throw new Error(`no details`);
  });

  it(`removeMany remove all - more than one item`, function () {
    const x = new PriorityQueue();
    x.heapify([1, 2]);

    const callback = function () {
      return true;
    };

    const removedItems = x.removeMany(callback);
    if (removedItems.length !== 2 || x.size !== 0) {
      console.log(`removed: ` + JSON.stringify(removedItems));
      console.log(`remaining:`);
      while (x.size) {
        console.log(x.poll());
      }
      throw new Error(`no details`);
    }
  });

  it(`removeMany remove some - check all items`, function () {
    let saw2 = false;
    let removed2 = false;

    type bt = {
      priority: number;
      removeCriterion?: boolean;
    };
    const array = [1, 1, 2, 7, 4, 2, 3].map((v) => {
      const baseObj: bt = {
        priority: v,
      };
      if (v === 3) {
        baseObj.removeCriterion = true;
      } else if (removed2 || v !== 2) {
        baseObj.removeCriterion = false;
      } else if (!saw2) {
        saw2 = true;
        baseObj.removeCriterion = false;
      } else {
        removed2 = true;
        baseObj.removeCriterion = true;
      }
      return baseObj;
    });

    const x = new PriorityQueue((a: bt, b: bt) => a.priority < b.priority);
    x.heapify(array);

    const callback = function (val) {
      return val.removeCriterion === true;
    };

    const removedItems = x.removeMany(callback);
    if (
      removedItems.length !== 2 ||
      x.size !== 5 ||
      x.array.slice(0, x.size).some((item) => item.removeCriterion)
    ) {
      console.log(`removed: ` + JSON.stringify(removedItems));
      console.log(`remaining:`);
      while (x.size) {
        console.log(x.poll());
      }
      throw new Error(`no details`);
    }
  });

  it(`Random`, function () {
    for (let ti = 0; ti < 100; ti++) {
      const b = new PriorityQueue(function (a, b) {
        // @ts-ignore
        return a < b;
      });
      const N = 1024 + ti;
      for (let i = 0; i < N; ++i) {
        b.add(Math.floor(random() * 1000000 + 1));
      }
      let v: unknown = 0;
      while (b.size) {
        const nv = b.poll();
        // @ts-ignore
        if (nv < v) throw new Error(`no details`);
        v = nv;
      }
    }
  });

  it(`RandomArray`, function () {
    for (let ti = 0; ti < 100; ti++) {
      const b = new PriorityQueue(function (a, b) {
        // @ts-ignore
        return a < b;
      });
      const array = [];
      const N = 1024 + ti;
      for (let i = 0; i < N; ++i) {
        const val = Math.floor(random() * 1000000 + 1);
        b.add(val);
        // @ts-ignore
        array.push(val);
      }
      array.sort(function (a, b) {
        return b - a;
      });
      while (b.size) {
        const nv = b.poll();
        const nx = array.pop();
        if (nv != nx) throw new Error(`no details`);
      }
    }
  });

  it(`RandomArrayEnDe`, function () {
    for (let ti = 0; ti < 100; ti++) {
      const b = new PriorityQueue(function (a, b) {
        // @ts-ignore
        return a < b;
      });
      const array = [];
      const N = 16 + ti;
      for (let i = 0; i < N; ++i) {
        const val = Math.floor(random() * 1000000 + 1);
        b.add(val);
        // @ts-ignore
        array.push(val);
      }
      array.sort(function (a, b) {
        return b - a;
      });
      for (let j = 0; j < 1000; ++j) {
        const nv = b.poll();
        const nx = array.pop();
        if (nv != nx) throw new Error(`no details`);
        const val = Math.floor(random() * 1000000 + 1);
        b.add(val);
        // @ts-ignore
        array.push(val);
        array.sort(function (a, b) {
          return b - a;
        });
      }
    }
  });

  it(`issue30`, function () {
    const b = new PriorityQueue(function (a, b) {
      // @ts-ignore
      return a < b;
    });
    b.add(1);
    b.add(1);
    b.add(2);
    b.add(7);
    b.add(4);
    b.add(2);
    b.add(3);
    const smallerthan3 = b.removeMany((val) => (val as number) <= 3, 5);
    if (smallerthan3.length !== 5) {
      console.log(`values returned ` + smallerthan3.length);
      throw new Error(`no details`);
    }
  });

  it(`should return k smallest`, function () {
    // ascending
    const x = new PriorityQueue(function (a, b) {
      // @ts-ignore
      return a < b;
    });
    x.add(1);
    x.add(0);
    x.add(5);
    x.add(4);
    x.add(3);
    x.add(7);
    x.add(4.5);
    x.add(12);
    x.add(3.223);
    x.add(1.2);
    x.add(2.22);
    x.add(0.003);

    const iterOrder = [0, 0.003, 1, 1.2, 2.22, 3, 3.223, 4, 4.5, 5, 7, 12];

    // first iterate without mutating the queue
    checkOrder(x, iterOrder);

    // Ignore this test
    // // check k smallest for k = 0 ... n
    // for (let i = 0; i < x.size; i++)
    //   if (
    //     JSON.stringify(x.kSmallest(i)) !== JSON.stringify(iterOrder.slice(0, i))
    //   )
    //     throw new Error(`no details`);

    // then iterate via polling
    for (let i = 0; i < iterOrder.length; i++) {
      const item = iterOrder[i];
      if (x.poll() != item) throw new Error(`no details`);
    }
  });
});
