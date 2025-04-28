import type { OfKind } from "../OfUnion.ts";
export type Ops<T> = Op<"add", T> | Op<"remove", T> | Op<"map", Mapper<T>>;
export type Op<K extends OpKind, A> = { kind: K; args: A[] };
export type OpKind = "add" | "remove" | "map";
export type OpSet<T> = { [key in OpKind]: OfKind<Ops<T>, key>["args"] };
export type Plan<T> = OpSet<T>[];
export type OpFn<A> = (a: A[], i: number) => unknown;
export type Operator<T> = {
  add: OpFn<T>;
  remove: OpFn<T>;
  map: OpFn<Mapper<T>>;
};
export type Mapper<T> = (item: T) => T;
