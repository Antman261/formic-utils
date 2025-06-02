import type { Obj, ObjWide } from '../commonTypes/mod.ts';

const _borrow: unique symbol = Symbol('borrow-kind');

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

/**
 * defineProperty is ~40% faster if the object has no prototype, which is what Object.create(null) gives us
 *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
 */
const mutableDescriptor = Object.create(null);
mutableDescriptor.value = 'm';

export const toBorrow = <T extends Obj>(v: T, kind: BorrowKind): Mutable<T> => {
  /**
   * only call defineProperty if necessary:
   * * 3.5ns to check property
   * * 75ns to redefine existing property
   * * 105ns to use defineProperty for the first time
   */
  // @ts-expect-error _borrow is a secret property
  if (v[_borrow] !== kind) {
    // uses defineProperty to prevent enumeration, rewriting
    //
    /**
     * use defineProperty to prevent enumeration, rewriting
     * passing statically defined mutableDescriptor to prevent redundant object instantiations, improving performance by ~10ns
     */
    Object.defineProperty(v, _borrow, mutableDescriptor);
  }
  return v as Mutable<T>;
};

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
