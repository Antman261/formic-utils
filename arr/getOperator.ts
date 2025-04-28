import type { Operator, Mapper } from "./ArrFromTypes.ts";

export function getOperator<T>(ar: T[]): Operator<T> {
  const mxs = new Map<Mapper<T>[], Mapper<T>>();
  return {
    add: (args) => ar.push(...(args ?? [])),
    remove: (args, i) => args?.includes(ar[i]) && ar.splice(i, 1).length,
    map(args, idx) {
      if (args.length === 0) return;
      const mx =
        mxs.get(args) ??
        args.reduce(
          (p, c) => (it: T) => c(p(it)),
          (it: T) => it
        );
      mxs.set(args, mx);
      ar[idx] = mx(ar[idx]);
    },
  };
}
