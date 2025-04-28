import type { Ops, OpKind, Mapper } from "./ArrFromTypes.ts";
import { generatePlan } from "./generatePlan.ts";
import { getOperator } from "./getOperator.ts";

/**
 * Core array manipulation function that provides a fluent interface for transforming arrays.
 * This is an internal implementation detail - users should use the exported `arr` object instead.
 *
 * @param arr - The input array to transform
 * @param copy - Whether to create a copy of the input array before modifying it
 * @returns An object with methods for chaining array operations
 */
const _with = <T>(arr: T[], copy = false) => {
  const target = copy ? [...arr] : arr;
  const ops: Ops<T>[] = [];
  const makeOp =
    <A>(kind: OpKind) =>
    (...args: A[]) => {
      const op = ops.at(-1); // @ts-expect-error ok
      op?.kind === kind ? op.args.push(...args) : ops.push({ kind, args });
      return wrapper;
    };
  const wrapper = {
    /**
     * Remove specified items from the array based on strict equality.
     */
    remove: makeOp<T>("remove"),
    /**
     * Add items to the end of the array
     * @param items - Items to add to the array
     */
    add: makeOp<T>("add"),
    /**
     * Transform array items using a mapping function
     * @param fn - Function to transform each item
     */
    map: makeOp<Mapper<T>>("map"),
    /**
     * Execute all queued operations and return the resulting array
     * @returns The transformed array
     */
    result() {
      const isNoop = target.length === 0 || ops.length === 0;
      if (isNoop) return target;
      const operator = getOperator(target);
      for (const step of generatePlan(ops)) {
        operator.add(step.add, 0);
        if (step.remove.length || step.map.length) {
          const remover = (i: number) => operator.remove(step.remove, i);
          const mapper = (i: number) => operator.map(step.map, i);
          const operate = (i: number) => remover(i) || mapper(i);
          for (let i = target.length - 1; i > -1; i--) operate(i);
        }
      }
      return target;
    },
  };
  return wrapper;
};

/**
 * Array Manipulation Utilities
 *
 * This module provides a fluent interface for manipulating arrays with a focus on
 * performance and composability. The main utility is the `with` function which
 * allows you to chain operations on arrays.
 *
 * @example
 * ```ts
 * // Basic usage with array modification
 * const result = from([1, 2, 3])
 *   .add(4)
 *   .remove(2)
 *   .map(x => x * 2)
 *   .result();
 * // result: [2, 6, 8]
 *
 * // Working with a copy of the array
 * const original = [1, 2, 3];
 * const modified = arr.from(original)
 *   .add(4)
 *   .result();
 * // original is [1, 2, 3]
 * // modified is [1, 2, 3, 4]
 * ```
 *
 * ## Features
 *
 * - **Fluent Interface**: Chain multiple operations together
 * - **Immutability Option**: Use `from` to work with a copy of the array
 * - **Optimized Operations**: Operations are batched and executed efficiently
 * - **Type Safety**: Full TypeScript support
 *
 * ## Methods
 * - `with(arr)`: Start a chain of operations on the array (modifies original)
 * - `from(arr)`: Start a chain of operations on a copy of the array
 *
 * ## Operations
 * - `add(...items)`: Add items to the end
 * - `remove(...items)`: Remove specific items
 * - `map(fn)`: Transform items
 * - `result()`: Execute operations and get result
 *
 * ## Performance Considerations
 *
 * The utilities are designed to be efficient by:
 * - Batching operations when possible
 * - Minimizing array copies thus reducing memory allocation and garbage collection
 * - Preventing redundant iterations over the array
 */
export const arr = {
  /**
   * Start a chain of operations on the array (modifies original).
   * @example
   * ```ts
   * const result = arr.with([1, 2, 3])
   *   .remove(2)
   *   .add(4)
   *   .map(x => x * 2)
   *   .result();
   * // result: [2, 6, 8]
   * ```
   */
  with: _with,
  /**
   * Start a chain of operations on a copy of the array.
   * @example
   * ```ts
   * const original = [1, 2, 3];
   * const modified = arr.from(original)
   *   .add(4)
   *   .result();
   * // original is [1, 2, 3]
   * // modified is [1, 2, 3, 4]
   * ```
   */
  from: <T>(arr: T[]) => _with(arr, true),
};
