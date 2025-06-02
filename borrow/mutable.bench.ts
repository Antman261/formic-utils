import type { Mutable } from './borrow.ts';
import { takeMutable, withMutable, withStrictMutable } from './mutable.ts';

type TestObj = { value: string };

const mutateObject = (o: Mutable<TestObj>) => {
  o.value += ' mutated';
};

const mutateObjectAsynchronously = async (o: Mutable<TestObj>, msg?: string) => {
  o.value += msg ?? ' mutated';
};
let obj: TestObj = { value: 'hello!' };

Deno.bench(
  'synchronously mutate object',
  () => {
    // @ts-expect-error Branded type error
    mutateObject(obj);
  },
);
obj = { value: 'hello!' };
Deno.bench(
  'synchronously mutate object with takeMutable',
  () => {
    mutateObject(takeMutable(obj));
  },
);

Deno.bench(
  'asynchronously mutate object',
  async () => {
    // @ts-expect-error Branded type error
    await mutateObjectAsynchronously(obj);
  },
);

obj = { value: 'hello!' };
const mutateObjectWithAsyncBorrow = withMutable(mutateObjectAsynchronously);
Deno.bench(
  'mutate object with takeMutable + withMutable',
  async () => {
    await mutateObjectWithAsyncBorrow(takeMutable(obj));
  },
);
obj = { value: 'hello!' };
Deno.bench(
  'mutate object with withMutable',
  async () => {
    // @ts-expect-error Branded type error
    await mutateObjectWithAsyncBorrow(obj);
  },
);
obj = { value: 'hello!' };
const mutateObjectWithStrictBorrow = withStrictMutable(mutateObjectAsynchronously);
Deno.bench(
  'mutate object with takeMutable + withStrictMutable',
  async () => {
    await mutateObjectWithStrictBorrow(takeMutable(obj));
  },
);
obj = { value: 'hello!' };
Deno.bench(
  'mutate object with withStrictMutable',
  async () => {
    // @ts-expect-error Branded type error
    await mutateObjectWithStrictBorrow(obj);
  },
);
