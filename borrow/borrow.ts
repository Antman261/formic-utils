import type { Obj, ObjWide } from '../commonTypes/mod.ts';

export const _borrow: unique symbol = Symbol('borrow-kind');

type BorrowKind = 'm' | 's'; // mutable | sequential
export type Borrow<T extends Obj, BK extends BorrowKind> = T & { [_borrow]: BK };

/**
 * Wrap a function argument with Mutable to inform callers that the provided value will be mutated.
 */
export type Mutable<T extends Obj> = Borrow<T, 'm'>;

/**
 * Wrap a function argument with Sequential to require callers to wait for the object to become available
 */
export type Sequential<T extends Obj> = Borrow<T, 's'>;

/**
 * defineProperty is ~40% faster if the object has no prototype, which is what Object.create(null) gives us
 *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
 */
const mutableDescriptor = Object.create(null);
mutableDescriptor.value = 'm';
const sequentialDescriptor = Object.create(null);
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
  if (!isBorrow(v, kind)) {
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

export const checkMutablyBorrowed = <T extends Obj>(v: T): boolean => mutableBorrows.has(v);
export const borrowMutably = <T extends Obj>(v: T) => mutableBorrows.add(v);
export const returnMutableBorrow = <T extends Obj>(v: T) => mutableBorrows.delete(v);

export type SeqBorrowState = {
  locked: boolean;
  promise: Promise<void>;
  return(): void;
  borrow(): void;
  resolve(): void;
};

const sequentialBorrows = new WeakMap<Obj<unknown>, SeqBorrowState>();
export const setSeqBorrow = <T extends Obj>(v: T, s: SeqBorrowState) => sequentialBorrows.set(v, s);
export const getSeqBorrow = <T extends Obj>(v: T): SeqBorrowState | undefined => sequentialBorrows.get(v);
export const hasSeqBorrow = <T extends Obj>(v: T): boolean => sequentialBorrows.has(v);
