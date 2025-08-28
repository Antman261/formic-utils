import { assert, assertFalse } from '@std/assert';
import { is, isDefined, isFalse, isTrue, isUndefined } from './is.ts';

Deno.test('isDefined ', () => {
  assert(isDefined(0));
  assert(isDefined({}));
  assert(isDefined(false));
  assert(isDefined(NaN));
  assertFalse(isDefined(undefined));
  // @ts-expect-error won't exist on type
  assertFalse(isDefined({}.foo));
  assertFalse(isDefined([].at(4)));
});

Deno.test('isUndefined ', () => {
  assertFalse(isUndefined(0));
  assertFalse(isUndefined({}));
  assertFalse(isUndefined(false));
  assertFalse(isUndefined(NaN));
  assert(isUndefined(undefined));
  // @ts-expect-error won't exist on type
  assert(isUndefined({}.foo));
  assert(isUndefined([].at(4)));
  const x: number | undefined = 1;
  if (isUndefined(x)) return;
  assert(x);
});

Deno.test('isTrue', () => {
  assertFalse(isTrue(0));
  assertFalse(isTrue(-0));
  assert(isTrue(1));
  assert(isTrue({}));
  assertFalse(isTrue(false));
  assertFalse(isTrue(NaN));
  assertFalse(isTrue(undefined));
  // @ts-expect-error won't exist on type
  assertFalse(isTrue({}.foo));
  assertFalse(isTrue([].at(4)));
});

Deno.test('isFalse', () => {
  assert(isFalse(0));
  assert(isFalse(-0));
  assertFalse(isFalse(1));
  assertFalse(isFalse({}));
  assert(isFalse(false));
  assert(isFalse(NaN));
  assert(isFalse(undefined));
  // @ts-expect-error won't exist on type
  assert(isFalse({}.foo));
  assert(isFalse([].at(4)));
});

Deno.test('is', () => {
  assert(is(5).greaterThan(4));
});
