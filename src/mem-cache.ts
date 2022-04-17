import { PriorityQueue } from "./priority-queue.js";

class InvalidState extends Error {
  constructor(...args) {
    super(...args);
    this.name = `InvalidState`;
  }
}

class TimeoutPriorityMappedQueue<T> {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private head: TimedItem<T> | null = null;
  private queue: PriorityQueue<TimedItem<T>>;
  private entryMap = new Map<string, TimedItem<T>>();
  constructor(public ttl: number, public onDelete: (key: string) => void) {
    this.queue = new PriorityQueue<TimedItem<T>>(
      (a, b) => a.ttlTimestamp < b.ttlTimestamp
    );
  }

  set(key: string, value: T, ttl?: number) {
    const existing = this.entryMap.get(key);
    if (existing) {
      existing.value = value;
      this.touch(key, ttl, ttl !== undefined);
      return;
    }

    const item = new TimedItem(key, value, Date.now() + (ttl ?? this.ttl), ttl);

    this.queue.add(item);
    this.entryMap.set(key, item);

    if (this.timer === null) {
      this.#setHeadTimer(item);
    } else {
      if (!this.head) throw new InvalidState(`timer is not null but head is`);
      if (this.head.ttlTimestamp > item.ttlTimestamp)
        // If this line errors, it means that there was a bug in state management
        this.#setHeadTimer(item);
    }
  }

  touch(key: string, ttl?: number, assignTtl = false) {
    const item = this.entryMap.get(key);
    if (!item) return undefined;

    this.queue.remove(item); // Same reference
    if (assignTtl) item.ttl = ttl;

    item.ttlTimestamp = Date.now() + (ttl ?? item.ttl ?? this.ttl);

    this.queue.add(item); // But looks better

    if (this.head === item) {
      // Update timer
      const p = this.queue.peek();
      if (!p)
        throw new InvalidState(
          `no item in queue but an item existed in entryMap`
        );
      this.#setHeadTimer(p);
    }
    return item;
  }

  get(key: string) {
    return this.touch(key)?.value;
  }

  getItem(key: string) {
    return this.touch(key);
  }

  keys() {
    return this.entryMap.keys();
  }

  has(key: string) {
    return this.entryMap.has(key);
  }

  /**
   * Excplit (head must exist)
   */
  #setHeadTimer(head: TimedItem<T>) {
    if (this.queue.size === 0) throw new InvalidState(`queue is empty`);
    this.head = head;
    if (this.timer) clearTimeout(this.timer);
    const selfRef = (this.timer = setTimeout(() => {
      if (this.timer !== selfRef)
        throw new InvalidState(`Timer was not managed correctly`);
      this.timer = null;
      this.head = null;
      const p = this.queue.poll();
      if (!p) throw new InvalidState(`invalid state: no item in queue`);
      this.entryMap.delete(p.key);
      this.onDelete(p.key);

      if (this.queue.size > 0) {
        const next = this.queue.peek();
        if (!next)
          throw new InvalidState(
            `invalid state: no item in queue but size is above 0`
          );
        this.#setHeadTimer(next);
      }
    }, head.ttlTimestamp - Date.now()).unref());
  }

  updateValue(key: string, value: T) {
    const item = this.entryMap.get(key);
    if (!item) return false;
    item.value = value;
    return true;
  }

  delete(key: string) {
    const item = this.entryMap.get(key);
    if (item === this.head) {
      this.queue.remove(item);
      const next = this.queue.peek();
      this.entryMap.delete(key);
      if (next) {
        this.#setHeadTimer(next);
      } else {
        this.head = null;
        if (this.timer) clearTimeout(this.timer);
        this.timer = null;
      }
      return true;
    }
    if (!item) return false;
    this.queue.remove(item);
    this.entryMap.delete(key);
    return true;
  }
}

class MemoryCache<T> {
  private mq: TimeoutPriorityMappedQueue<T>;
  constructor({ ttl = 0 }: { ttl?: number } = {}) {
    this.mq = new TimeoutPriorityMappedQueue(ttl, () => null);
  }
  get(key: string) {
    return this.mq.get(key);
  }
  set(key: string, value: T, ttl?: number) {
    return this.mq.set(key, value, ttl);
  }
  delete(key: string) {
    return this.mq.delete(key);
  }

  ttl(key: string, ttl?: number) {
    return this.mq.touch(key, ttl, true);
  }

  getItem(key: string) {
    return this.mq.getItem(key);
  }

  keys() {
    return [...this.mq.keys()];
  }

  has(key: string) {
    return this.mq.has(key);
  }
}

class TimedItem<T> {
  constructor(
    public readonly key: string,
    public value: T,
    public ttlTimestamp: number,
    public ttl?: number
  ) {}
  toString() {
    return `[${this.ttlTimestamp}]@[${this.key}]->${
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.value as any).toString ? (this.value as any).toString() : this.value
    }`;
  }
}

function MemoryCacheProxy<T>(
  opts: ConstructorParameters<typeof MemoryCache>[0]
) {
  const mc = new MemoryCache<T>(opts);
  return new Proxy(mc, {
    get: (target, prop) => {
      if (typeof prop === `symbol`) {
        return Reflect.get(target, prop);
      }
      return target.get(prop);
    },
    set: (target, prop, value) => {
      if (typeof prop === `symbol`) {
        return Reflect.set(target, prop, value);
      }
      target.set(prop, value);
      // This line is important
      return true;
    },
    deleteProperty: (target, prop) => {
      if (typeof prop === `symbol`) {
        return Reflect.deleteProperty(target, prop);
      }
      return target.delete(prop);
    },
    ownKeys: (target) => {
      return target.keys();
    },
    has: (target, prop) => {
      if (typeof prop === `symbol`) {
        return Reflect.has(target, prop);
      }
      return target.has(prop);
    },
  });
}

export { MemoryCache, MemoryCacheProxy, TimeoutPriorityMappedQueue };
