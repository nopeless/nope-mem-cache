/* eslint-disable @typescript-eslint/ban-ts-comment */
import { TimeoutPriorityMappedQueue } from "./src/mem-cache.js";

const sleep = (t) =>
  new Promise((resolve) => {
    setTimeout(resolve, t);
  });

const q = new TimeoutPriorityMappedQueue<string>(1000, () => null);

const parr = () => {
  const arr = [];
  // @ts-ignore
  q.queue.forEach((v) => {
    arr.push(v.toString());
  });

  console.log(arr.map((v) => v.toString()));
};

q.set(`1000`, `2`);
q.set(`1500`, `3`, 1500);
q.set(`500`, `1`, 500);

await sleep(250);

parr();

q.set(`500`, `1`, 1000);

console.log(`after touching`);
parr();

await sleep(500);

parr();

await sleep(250);

parr();

await sleep(250);

parr();
