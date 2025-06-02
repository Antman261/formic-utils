import type { Obj, ObjWide } from '../commonTypes/mod.ts';

export const _borrow: unique symbol = Symbol('borrow-kind');

type BorrowKind = 'm' | 's'; // mutable | sequential
export type Borrow<BK extends BorrowKind> = { [_borrow]: BK };

/**
 * Wrap a function argument with Mutable to inform callers that the provided value will be mutated.
 */
export type Mutable<T extends Obj<unknown>> = T & Borrow<'m'>;

/**
 * Wrap a function argument with Sequential to require callers to wait for the object to become available
 */
export type Sequential<T extends Obj<unknown>> = T & Borrow<'s'>;

/**
 * defineProperty is ~40% faster if the object has no prototype, which is what Object.create(null) gives us
 *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
 */
export const mutableDescriptor = Object.create(null);
mutableDescriptor.value = 'm';
export const sequentialDescriptor = Object.create(null);
sequentialDescriptor.value = 's';

export function isBorrow<T extends ObjWide>(v: T, kind: 'm'): v is Mutable<T>;
export function isBorrow<T extends ObjWide>(v: T, kind: 's'): v is Sequential<T>;
export function isBorrow<T extends ObjWide>(v: T, kind: BorrowKind): v is Sequential<T> | Mutable<T>; // another "bug-feature" TS maintainers don't want to fix https://github.com/microsoft/TypeScript/issues/44452
export function isBorrow<T extends ObjWide>(v: T, kind: BorrowKind): v is Sequential<T> | Mutable<T> {
  return v[_borrow] === kind;
}

export function toBorrow<T extends ObjWide>(v: T, kind: 'm'): Mutable<T>;
export function toBorrow<T extends ObjWide>(v: T, kind: 's'): Sequential<T>;
export function toBorrow<T extends ObjWide>(v: T, kind: BorrowKind): Mutable<T> | Sequential<T> {
  /**
   * only call defineProperty if necessary:
   * * 3.5ns to check property
   * * 75ns to redefine existing property
   * * 105ns to use defineProperty for the first time
   */
  if (v[_borrow] !== 'm') {
    /**
     * use defineProperty to prevent enumeration & rewriting.
     * uses statically defined mutableDescriptor to prevent redundant object instantiations & improve performance by ~10ns
     */
    Object.defineProperty(v, _borrow, kind === 'm' ? mutableDescriptor : sequentialDescriptor);
  }
  // @ts-expect-error ok
  return v;
}

const mutableBorrows = new WeakSet<Obj<unknown>>();

export const isMutablyBorrowable = <T extends Obj>(v: ObjWide): v is Mutable<T> => v[_borrow] === 'm';
export const checkMutablyBorrowed = <T extends Obj>(v: T): boolean => mutableBorrows.has(v);
export const borrowMutably = <T extends Obj>(v: T) => mutableBorrows.add(v);
export const returnMutableBorrow = <T extends Obj>(v: T) => mutableBorrows.delete(v);

type SeqBorrowState = {
  locked: boolean;
  promise: Promise<void>;
  return(): void;
  borrow(): void;
  resolve(): void;
};
const makeSeqBorrowState = (): SeqBorrowState => {
  const { promise, resolve } = Promise.withResolvers<void>();
  const state: SeqBorrowState = {
    locked: true,
    borrow() {
      Object.assign(state, Promise.withResolvers<void>(), { locked: true });
    },
    return() {
      state.locked = false;
      state.resolve();
    },
    promise,
    resolve,
  };
  return state;
};

const sequentialBorrows = new WeakMap<Obj<unknown>, SeqBorrowState>();

export const borrowSequentially = async <T extends Obj>(v: Sequential<T>) => {
  if (!isBorrow(v, 's')) return;
  if (!sequentialBorrows.has(v)) return sequentialBorrows.set(v, makeSeqBorrowState());
  const state = sequentialBorrows.get(v)!;
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

export const returnSequentialBorrow = <T extends Obj>(v: T) => {
  sequentialBorrows.get(v)?.return();
};
