export type OfUnion<U, D extends string | number | symbol, K> = Extract<
  U,
  { [key in D]: K }
>;

export type OfKind<U, K> = OfUnion<U, 'kind', K>;
export type OfType<U, K> = OfUnion<U, 'type', K>;
