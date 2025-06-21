import { delay } from '@std/async/delay';
import type { Sequential } from './borrow.ts';
import { takeSequential, withSequential } from './sequential.ts';

type TestObj = { value: string };
type TestObj2 = { v: number[] };
type A = Sequential<TestObj2> | TestObj2;

const mutateObjectAsync = async (o: Sequential<TestObj> | TestObj, msg = '', ms = 4) => {
  await delay(ms);
  o.value += ' mutated';
  o.value += msg;
};

const mutateMultipleAsync = async (num: number, ...args: A[]) => {
  await delay(1);
  for (const arg of args) {
    arg.v.push(num);
  }
};
const mutateMultipleSequentially = withSequential(mutateMultipleAsync);

const mutateObjectSequentially = withSequential(mutateObjectAsync);
let obj: TestObj = { value: 'hello!' };
const obj2: TestObj2 = { v: [] };
const obj3: TestObj2 = { v: [] };
const obj4: TestObj2 = { v: [] };
const obj5: TestObj2 = { v: [] };
const obj6: TestObj2 = { v: [] };
const obj7: TestObj2 = { v: [] };

Deno.bench('Using withSequential', async () => {
  mutateObjectSequentially(takeSequential(obj), ' 1st!');
  mutateObjectSequentially(takeSequential(obj), ' 2nd!', 7);
  mutateObjectSequentially(takeSequential(obj), ' 3rd!', 2);
  mutateObjectSequentially(takeSequential(obj), ' 4th!', 4);
  mutateObjectSequentially(takeSequential(obj), ' 5th!', 10);
  mutateObjectSequentially(takeSequential(obj), ' 6th!', 2);
  await mutateObjectSequentially(takeSequential(obj), ' 7th!', 2);
});

Deno.bench('Using withSequential with multiple arguments', async () => {
  mutateMultipleSequentially(1, takeSequential(obj2), takeSequential(obj3));
  mutateMultipleSequentially(1.5, takeSequential(obj3), takeSequential(obj5), takeSequential(obj4));
  mutateMultipleSequentially(2, takeSequential(obj2), takeSequential(obj6));
  mutateMultipleSequentially(3, takeSequential(obj3), takeSequential(obj6), takeSequential(obj5));
  mutateMultipleSequentially(5, takeSequential(obj6), takeSequential(obj5));
  mutateMultipleSequentially(6, takeSequential(obj4));
  await mutateMultipleSequentially(
    8,
    takeSequential(obj2),
    takeSequential(obj3),
    takeSequential(obj4),
    takeSequential(obj5),
    takeSequential(obj6),
    takeSequential(obj7),
  );
});
Deno.bench('Without withSequential, sequentially with multiple arguments', async () => {
  await mutateMultipleAsync(1, takeSequential(obj2), takeSequential(obj3));
  await mutateMultipleAsync(1.5, takeSequential(obj3), takeSequential(obj5), takeSequential(obj4));
  await mutateMultipleAsync(2, takeSequential(obj2), takeSequential(obj6));
  await mutateMultipleAsync(3, takeSequential(obj3), takeSequential(obj6), takeSequential(obj5));
  await mutateMultipleAsync(5, takeSequential(obj6), takeSequential(obj5));
  await mutateMultipleAsync(6, takeSequential(obj4));
  await mutateMultipleAsync(
    8,
    takeSequential(obj2),
    takeSequential(obj3),
    takeSequential(obj4),
    takeSequential(obj5),
    takeSequential(obj6),
    takeSequential(obj7),
  );
});
obj = { value: 'hello!' };
Deno.bench('without withSequential, sequentially', async () => {
  await mutateObjectAsync(obj, ' 1st!');
  await mutateObjectAsync(obj, ' 2nd!', 7);
  await mutateObjectAsync(obj, ' 3rd!', 2);
  await mutateObjectAsync(obj, ' 4th!', 4);
  await mutateObjectAsync(obj, ' 5th!', 10);
  await mutateObjectAsync(obj, ' 6th!', 2);
  await mutateObjectAsync(obj, ' 7th!', 2);
});
obj = { value: 'hello!' };
Deno.bench('without withSequential, concurrently', async () => {
  await Promise.all([
    mutateObjectAsync(obj, ' 1st!'),
    mutateObjectAsync(obj, ' 2nd!', 7),
    mutateObjectAsync(obj, ' 3rd!', 2),
    mutateObjectAsync(obj, ' 4th!', 4),
    mutateObjectAsync(obj, ' 5th!', 10),
    mutateObjectAsync(obj, ' 6th!', 2),
    mutateObjectAsync(obj, ' 7th!', 2),
  ]);
});
