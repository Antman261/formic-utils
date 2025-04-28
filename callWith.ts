import type { Func } from "./Func.ts";

/**
 * Useful for providing static values to higher order functions.
 *
 * ```
 * @example Call reducer wiretaps
 * ```ts ignore
 * import { callWith } from '@antman/formic-utils';
 *
 * const withWiretaps =
 *  (reduce: Reducer): Reducer =>
 *   (state, event) => {
 *     const updated = reduce(state, event);
 *     wiretaps.forEach(callWith(event, updated));
 *     // equivalent to: wiretaps.forEach((tap) => tap(event, updated));
 *     return updated;
 *   };
 * ```
 */
export const callWith =
  <F extends Func>(...args: Parameters<F>) =>
  (fn: F): F =>
    fn(...args) as F;
