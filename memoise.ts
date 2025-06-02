import type { Func } from "./commonTypes/Func.ts";

export const memoise = <Fn extends Func>(fn: Fn): Fn => {
  let wasCalled = false;
  let result: ReturnType<Fn>;
  return (() => {
    if (wasCalled) return result;
    result = fn() as ReturnType<Fn>;
    wasCalled = true;
    return result;
  }) as Fn;
};
