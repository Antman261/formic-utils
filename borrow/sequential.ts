import type { AsyncFunc, Obj } from '../commonTypes/mod.ts';
import { borrowSequentially, returnSequentialBorrow, type Sequential, toBorrow } from './borrow.ts';

export const takeSequential = <T extends Obj<unknown>>(v: T): Sequential<T> => toBorrow(v, 's');

export const withSequential = <Fn extends AsyncFunc>(fn: Fn): Fn =>
  (async (...args) => {
    const borrowPromises: Promise<unknown>[] = [];
    for (const arg of args) borrowPromises.push(borrowSequentially(arg));
    await Promise.all(borrowPromises);
    const result = await fn(...args);
    for (const arg of args) returnSequentialBorrow(arg);
    return result;
  }) as Fn;
