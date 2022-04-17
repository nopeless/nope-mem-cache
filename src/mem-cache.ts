class MemoryCache<T> {
  public ttl: number;
  constructor({ ttl = -1 }: { ttl: number }) {
    this.ttl = ttl;
  }
}

function MemoryCacheProxy<T>() {
  return new Proxy(Object.create(null), {});
}

export {};
