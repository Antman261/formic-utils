import type { AsyncFunc, Obj } from '../commonTypes/mod.ts';
import { borrowSequentially, returnMutableBorrow, type Sequential, toSequential } from './borrow.ts';

export const takeSequential = <T extends Obj<unknown>>(v: T): Sequential<T> => toSequential(v);

export const withSequential = <Fn extends AsyncFunc>(fn: Fn): Fn =>
  (async (...args) => {
    for (const arg of args) await borrowSequentially(arg);
    const result = await fn(...args);
    for (const arg of args) returnMutableBorrow(arg);
    return result;
  }) as Fn;
