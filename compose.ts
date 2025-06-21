import type { Func } from "./commonTypes/Func.ts";

/**
 * Generic type for higher order function.
 *
 * ```
 * @example Compose reducer function with higher order functions
 * ```ts ignore
 * export const reduceState = compose(
 *   <T extends EventType>(s: State, e: EventMap[T]) => getReducer(e.type)(s, e),
 *   [withDebugLogging('reduceState'), withWiretaps]
 * );
 */
export type Hof<Fn extends Func> = (fn: Fn) => Fn;

export const compose = <Fn extends Func>(fn: Fn, hofs: Hof<Fn>[]): Fn =>
  hofs.reduceRight<Fn>(enhanceFunc, fn);

const enhanceFunc = <Fn extends Func>(fn: Fn, hof: Hof<Fn>) => (fn = hof(fn));
