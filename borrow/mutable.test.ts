import { assertSpyCall, assertSpyCalls, spy } from '@std/testing/mock';
import { delay } from '@std/async';
import { expect } from '@std/expect';
import { takeMutable, withMutable, withStrictMutable } from './mutable.ts';
import { assertRejects } from '@std/assert';
import type { Mutable } from './borrow.ts';
import { makeTestFrame } from '../testing/makeTestFrame.ts';
import { deserialize, serialize } from 'node:v8';

type TestObj = { value: string };

const mutateObject = (o: Mutable<TestObj>) => {
  o.value += ' mutated';
};

const mutateObjectAsynchronously = async (o: Mutable<TestObj>, msg?: string) => {
  await delay(4);
  o.value += msg ?? ' mutated';
};

let obj: TestObj;
const withFrame = makeTestFrame({ beforeEach: () => obj = { value: 'hello!' } });

Deno.test(
  'Mutable values work transparently',
  withFrame(() => {
    mutateObject(takeMutable(obj));
    expect(obj.value).toEqual('hello! mutated');
  }),
);

Deno.test(
  'Mutable types provide compile time checks without changing behaviour',
  withFrame(() => {
    // @ts-expect-error Branded type error
    mutateObject(obj);
    expect(obj.value).toEqual('hello! mutated');
  }),
);

Deno.test(
  'withMutable + takeMutable works with asynchronous functions at runtime',
  withFrame(async () => {
    await withMutable(mutateObjectAsynchronously)(takeMutable(obj));
    expect(obj.value).toEqual('hello! mutated');
  }),
);

Deno.test(
  'withStrictMutable + takeMutable works with asynchronous functions at runtime',
  withFrame(async () => {
    expect(obj.value).toEqual('hello!');
    await withStrictMutable(mutateObjectAsynchronously)(takeMutable(obj));
    expect(obj.value).toEqual('hello! mutated');
  }),
);

Deno.test(
  'withStrictMutable tracks the return of mutable borrows, allowing subsequent borrows',
  withFrame(async () => {
    await withStrictMutable(mutateObjectAsynchronously)(takeMutable(obj), ' mutated first!');
    await withStrictMutable(mutateObjectAsynchronously)(takeMutable(obj), ' mutated second!');
    expect(obj.value).toEqual('hello! mutated first! mutated second!');
  }),
);

Deno.test(
  'withMutable wrapped functions do not impact runtime when provided vanilla objects',
  withFrame(async () => {
    const warnSpy = spy(console, 'warn');
    await (async () => {
      // @ts-expect-error Branded type error
      const promise = withMutable(mutateObjectAsynchronously)(obj);
      await delay(1);
      // @ts-expect-error Branded type error
      await withMutable(mutateObjectAsynchronously)(obj);
      await promise;
    })();
    assertSpyCalls(warnSpy, 0); // should not log since the object is not marked by the caller as a borrowable
    expect(obj.value).toEqual('hello! mutated mutated');
  }),
);

Deno.test(
  'withMutable logs when conflicting concurrent mutable borrows are taken',
  withFrame(async () => {
    const warnSpy = spy(console, 'warn');

    await (async () => {
      const promise = withMutable(mutateObjectAsynchronously)(takeMutable(obj));
      await delay(1);
      await withMutable(mutateObjectAsynchronously)(takeMutable(obj));
      await promise;
    })();

    assertSpyCall(warnSpy, 0, { args: ['Object already mutably borrowed:', obj] });
    assertSpyCalls(warnSpy, 1);
    expect(obj.value).toEqual('hello! mutated mutated');
  }),
);

Deno.test(
  'withStrictMutable throws when conflicting concurrent mutable borrows are taken ',
  withFrame(async () => {
    const promise = withStrictMutable(mutateObjectAsynchronously)(takeMutable(obj));
    await assertRejects(
      async () => await withStrictMutable(mutateObjectAsynchronously)(takeMutable(obj)),
    );
    expect(obj.value, 'Call without the borrow should not have mutated the object').toEqual('hello!');
    await promise;
    expect(obj.value, 'Call with the borrow should successfully mutate the object').toEqual('hello! mutated');
  }),
);

Deno.test(
  'takeMutable works transparently with asynchronous functions',
  withFrame(async () => {
    await mutateObjectAsynchronously(takeMutable(obj));
    expect(obj.value).toEqual('hello! mutated');
  }),
);

Deno.test(
  'Mutably borrowable objects do not log their borrow-kind property',
  withFrame(() => {
    expect(Deno.inspect(takeMutable(obj))).toEqual('{ value: "hello!" }');
  }),
);

Deno.test(
  'Mutably borrowable objects can be serialized',
  withFrame(() => {
    expect(deserialize(serialize(takeMutable(obj)))).toEqual({ value: 'hello!' });
  }),
);
