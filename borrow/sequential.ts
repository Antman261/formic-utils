import type { AsyncFunc, Obj } from '../commonTypes/mod.ts';
import { borrowSequentially, returnSequentialBorrow, type Sequential, toBorrow } from './borrow.ts';

export const takeSequential = <T extends Obj<unknown>>(v: T): Sequential<T> => toBorrow(v, 's');

export const withSequential = <Fn extends AsyncFunc>(fn: Fn): Fn =>
  (async (...args) => {
    for (const arg of args) await borrowSequentially(arg);
    const result = await fn(...args);
    for (const arg of args) returnSequentialBorrow(arg);
    return result;
  }) as Fn;
