import type { AsyncFunc, Obj } from '../commonTypes/mod.ts';
import {
  borrowMutably,
  checkMutablyBorrowed,
  isMutablyBorrowable,
  type Mutable,
  returnMutableBorrow,
  toMutable,
} from './borrow.ts';

/**
 * When calling a mutative function, wrap the mutable parameter(s) in takeMutable to acknowledge that the parameter will be mutated by the function.
 *
 * This function is compile-time only, providing no runtime borrow checking.
 */
export const takeMutable = <T extends Obj<unknown>>(v: T): Mutable<T> => toMutable(v);

/**
 * Wrap an asynchronous function that accepts one or more Mutable parameters in `withMutable` to ensure concurrent mutable borrows are correctly tracked by logging a warning if the value is concurrently borrowed more than once before being returned.
 *
 * Where takeMutable provides only compile time checking, withMutable provides runtime feedback without altering behavior.
 */
export const withMutable = <Fn extends AsyncFunc>(fn: Fn): Fn =>
  (async (...args) => {
    for (const arg of args) {
      if (isMutablyBorrowable(arg)) {
        if (checkMutablyBorrowed(arg)) {
          console.warn('Object already mutably borrowed:', arg);
          console.trace();
        }
        borrowMutably(arg);
      }
    }
    const result = await fn(...args);
    for (const arg of args) returnMutableBorrow(arg);
    return result;
  }) as Fn;

/**
 * Wrap an asynchronous function that accepts one or more Mutable parameters in `withStrictMutable` to ensure concurrent mutable borrows are correctly tracked by throwing an Error if the value is concurrently borrowed more than once before being returned.
 *
 * Unlike withMutable, withStrictMutable alters behavior.
 */
export const withStrictMutable = <Fn extends AsyncFunc>(fn: Fn): Fn =>
  (async (...args) => {
    for (const arg of args) {
      if (isMutablyBorrowable(arg)) {
        if (checkMutablyBorrowed(arg)) {
          throw new Error(`Object already mutably borrowed: ${arg}`);
        }
        borrowMutably(arg);
      }
    }
    const result = await fn(...args);
    for (const arg of args) returnMutableBorrow(arg);
    return result;
  }) as Fn;
