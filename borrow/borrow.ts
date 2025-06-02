import type { Obj, ObjWide } from '../commonTypes/mod.ts';

const _borrow: unique symbol = Symbol();

type BorrowKind = 'm' | 's'; // mutable | sequential
export type Borrow<BK extends BorrowKind> = { [_borrow]: BK };

/**
 * Wrap a function argument with Mutable to inform callers that the provided value will be mutated.
 */
export type Mutable<T extends Obj<unknown>> = T & Borrow<'m'>;

const _mutBrand = { [_borrow]: 'm' } as const;
const mutableBorrows = new WeakSet<Obj<unknown>>();

export const isMutablyBorrowable = <T extends Obj>(v: ObjWide): v is Mutable<T> => v[_borrow] === 'm';
export const checkMutablyBorrowed = <T extends Obj>(v: T): boolean => mutableBorrows.has(v);
export const borrowMutably = <T extends Obj>(v: T) => mutableBorrows.add(v);
export const returnMutableBorrow = <T extends Obj>(v: T) => mutableBorrows.delete(v);
export const toMutable = <T extends Obj>(v: T): Mutable<T> => Object.assign(v, _mutBrand);

/**
 * Wrap a function argument with Sequential to require callers to wait for the object to become available
 */
export type Sequential<T extends Obj<unknown>> = T & Borrow<'s'>;

type SequentialState = { locked: boolean; promise: Promise<void>; resolve: () => void };
const _seqBrand = { [_borrow]: 's' } as const;
const sequentialBorrows = new WeakMap<Obj<unknown>, SequentialState>();

export const borrowSequentially = async <T extends Obj>(v: Sequential<T>) => {
  if (v[_borrow] !== 's') return;
  if (sequentialBorrows.has(v)) {
    const state = sequentialBorrows.get(v)!;
    if (state.locked) {
      await state.promise;
      while (state.locked) {
        await state.promise;
        /* Waits until this callback is the first in the callback queue for the resolved promise.
          We know the first callback in the queue is the only callback that will see state.locked as false, and all callbacks will enqueue themselves on the subsequent promise in the same order. */
      }
    }
    // Taking the borrow
    state.locked = true;
    Object.assign(state, Promise.withResolvers());
    return;
  }
  sequentialBorrows.set(v, Object.assign({ locked: true }, Promise.withResolvers<void>()));
};

export const returnSequentialBorrow = <T extends Obj>(v: T) => {
  const state = sequentialBorrows.get(v);
  if (state) {
    state.locked = false;
    state.resolve();
  }
};

export const toSequential = <T extends Obj>(v: T): Sequential<T> => Object.assign(v, _seqBrand);
