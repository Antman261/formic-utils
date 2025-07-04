import type { AsyncFunc, Obj } from '../commonTypes/mod.ts';
import {
  getSeqBorrow,
  hasSeqBorrow,
  isBorrow,
  type SeqBorrowState,
  type Sequential,
  setSeqBorrow,
  toBorrow,
} from './borrow.ts';

/**
 * When calling a sequentially mutative function, wrap the mutable parameter(s) in takeSequential to acknowledge that the parameter will be sequentially mutated by the function.
 *
 * Unless the callee is wrapped in `withSequential`, `takeSequential` only provides compile-time checks.
 */
export const takeSequential = <T extends Obj<unknown>>(v: T): Sequential<T> => toBorrow(v, 's');

/**
 * Wrap an asynchronous function that accepts one or more Sequentially Mutable parameters in `withSequential` to ensure any concurrent mutable borrows are processed sequentially in the order each function attempted to access the borrowed object.
 *
 * This guarantees an object is never mutated concurrently by coordinating mutative access to the object. Read-only access remains unaffected.
 */
export const withSequential = <Fn extends AsyncFunc>(fn: Fn): Fn =>
  (async (...args) => {
    const borrowPromises: Promise<unknown>[] = [];
    for (const arg of args) borrowPromises.push(borrowSequentially(arg));
    await Promise.all(borrowPromises);
    const result = await fn(...args);
    for (const arg of args) returnSequentialBorrow(arg);
    return result;
  }) as Fn;

const borrowSequentially = async <T extends Obj>(v: Sequential<T>) => {
  if (!isBorrow(v, 's')) return;
  if (!hasSeqBorrow(v)) return setSeqBorrow(v, makeSeqBorrowState());
  const state = getSeqBorrow(v)!;
  if (state.locked) {
    /* Waits until this callback is the first in the callback queue for the resolved promise.
            We know the first callback in the queue is the only callback that will see state.locked as false, and all callbacks will enqueue themselves on the subsequent promise in the same order. */
    do {
      await state.promise;
    } while (state.locked);
  }
  state.borrow();
  return;
};

const returnSequentialBorrow = <T extends Obj>(v: T) => {
  getSeqBorrow(v)?.return();
};
const makeSeqBorrowState = (): SeqBorrowState => {
  const state: SeqBorrowState = {
    locked: true,
    borrow() {
      Object.assign(state, Promise.withResolvers<void>(), { locked: true });
    },
    return() {
      state.locked = false;
      state.resolve();
    },
    ...Promise.withResolvers<void>(),
  };
  return state;
};
