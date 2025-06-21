import type { Func } from "./commonTypes/Func.ts";

const debug = false;

export const withDebugLogging =
  (name?: string) =>
  <Fn extends Func>(fn: Fn): Fn =>
    ((...args) => {
      const fnName = name ?? fn.name;
      debug && console.log(`fn->${fnName}->args:`, args);
      const result = fn(...args);
      debug && console.log(`fn->${fnName}->result:`, result);
      return result;
    }) as Fn;
