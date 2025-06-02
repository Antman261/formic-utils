import { delay } from '@std/async';
import { expect } from '@std/expect';
import { makeTestFrame } from '../testing/makeTestFrame.ts';
import type { Sequential } from './borrow.ts';
import { takeSequential, withSequential } from './sequential.ts';

type TestObj = { value: string };

const mutateObjectAsync = async (o: Sequential<TestObj>, msg = '', ms = 4) => {
  await delay(ms);
  o.value += ' mutated';
  o.value += msg;
};

let obj: TestObj;
const withFrame = makeTestFrame({ beforeEach: () => obj = { value: 'hello!' } });

Deno.test(
  'withSequential works with a single function call',
  withFrame(async () => {
    expect(obj.value).toEqual('hello!');
    await withSequential(mutateObjectAsync)(takeSequential(obj));
    expect(obj.value).toEqual('hello! mutated');
  }),
);
Deno.test(
  'withSequential correctly returns borrows',
  withFrame(async () => {
    expect(obj.value).toEqual('hello!');
    await withSequential(mutateObjectAsync)(takeSequential(obj));
    await withSequential(mutateObjectAsync)(takeSequential(obj));
    expect(obj.value).toEqual('hello! mutated mutated');
  }),
);

Deno.test(
  'withSequential makes multiple function calls using the same object wait their turn',
  withFrame(async () => {
    expect(obj.value).toEqual('hello!');
    const mutateObjectSequentially = withSequential(mutateObjectAsync);
    await Promise.all([
      mutateObjectSequentially(takeSequential(obj), ' 1st!'),
      mutateObjectSequentially(takeSequential(obj), ' 2nd!', 7),
      mutateObjectSequentially(takeSequential(obj), ' 3rd!', 2),
      mutateObjectSequentially(takeSequential(obj), ' 4th!', 4),
      mutateObjectSequentially(takeSequential(obj), ' 5th!', 10),
      mutateObjectSequentially(takeSequential(obj), ' 6th!', 2),
      mutateObjectSequentially(takeSequential(obj), ' 7th!', 2),
    ]);
    expect(obj.value).toEqual(
      'hello! mutated 1st! mutated 2nd! mutated 3rd! mutated 4th! mutated 5th! mutated 6th! mutated 7th!',
    );
  }),
);
Deno.test(
  'withSequential makes awaiting the last call equivalent to Promise.all',
  withFrame(async () => {
    expect(obj.value).toEqual('hello!');
    const mutateObjectSequentially = withSequential(mutateObjectAsync);
    mutateObjectSequentially(takeSequential(obj), ' 1st!');
    mutateObjectSequentially(takeSequential(obj), ' 2nd!', 7);
    mutateObjectSequentially(takeSequential(obj), ' 3rd!', 2);
    mutateObjectSequentially(takeSequential(obj), ' 4th!', 4);
    mutateObjectSequentially(takeSequential(obj), ' 5th!', 10);
    mutateObjectSequentially(takeSequential(obj), ' 6th!', 2);
    await mutateObjectSequentially(takeSequential(obj), ' 7th!', 2);
    expect(obj.value).toEqual(
      'hello! mutated 1st! mutated 2nd! mutated 3rd! mutated 4th! mutated 5th! mutated 6th! mutated 7th!',
    );
  }),
);
Deno.test(
  'withSequential correctly sequences access across time ',
  withFrame(async () => {
    expect(obj.value).toEqual('hello!');
    const mutateObjectSequentially = withSequential(mutateObjectAsync);
    mutateObjectSequentially(takeSequential(obj), ' 1st!');
    mutateObjectSequentially(takeSequential(obj), ' 2nd!', 7);
    mutateObjectSequentially(takeSequential(obj), ' 3rd!', 2);
    await delay(3);
    mutateObjectSequentially(takeSequential(obj), ' 4th!', 4);
    mutateObjectSequentially(takeSequential(obj), ' 5th!', 10);
    mutateObjectSequentially(takeSequential(obj), ' 6th!', 2);
    await delay(6);
    mutateObjectSequentially(takeSequential(obj), ' 7th!', 2);
    mutateObjectSequentially(takeSequential(obj), ' 8th!', 2);
    mutateObjectSequentially(takeSequential(obj), ' 9th!', 2);
    await delay(1);
    mutateObjectSequentially(takeSequential(obj), ' 10th!', 2);
    await mutateObjectSequentially(takeSequential(obj), ' 11th!', 2);
    // ^ only have to await the last call because it is guaranteed to complete last!
    expect(obj.value).toEqual(
      'hello! mutated 1st! mutated 2nd! mutated 3rd! mutated 4th! mutated 5th! mutated 6th! mutated 7th! mutated 8th! mutated 9th! mutated 10th! mutated 11th!',
    );
  }),
);
Deno.test(
  'withSequential correctly sequences access with bigger gaps ',
  withFrame(async () => {
    expect(obj.value).toEqual('hello!');
    const mutateObjectSequentially = withSequential(mutateObjectAsync);
    mutateObjectSequentially(takeSequential(obj), ' 1st!');
    mutateObjectSequentially(takeSequential(obj), ' 2nd!', 7);
    mutateObjectSequentially(takeSequential(obj), ' 3rd!', 2);
    await delay(10);
    mutateObjectSequentially(takeSequential(obj), ' 4th!', 4);
    mutateObjectSequentially(takeSequential(obj), ' 5th!', 10);
    mutateObjectSequentially(takeSequential(obj), ' 6th!', 2);
    await delay(20);
    mutateObjectSequentially(takeSequential(obj), ' 7th!', 2);
    mutateObjectSequentially(takeSequential(obj), ' 8th!', 2);
    mutateObjectSequentially(takeSequential(obj), ' 9th!', 2);
    await delay(30);
    mutateObjectSequentially(takeSequential(obj), ' 10th!', 2);
    await mutateObjectSequentially(takeSequential(obj), ' 11th!', 2);
    expect(obj.value).toEqual(
      'hello! mutated 1st! mutated 2nd! mutated 3rd! mutated 4th! mutated 5th! mutated 6th! mutated 7th! mutated 8th! mutated 9th! mutated 10th! mutated 11th!',
    );
  }),
);
Deno.test(
  'Without withSequential, the results are not sequential',
  withFrame(async () => {
    expect(obj.value).toEqual('hello!');
    await Promise.all([
      mutateObjectAsync(takeSequential(obj), ' 1st!'),
      mutateObjectAsync(takeSequential(obj), ' 2nd!', 7),
      mutateObjectAsync(takeSequential(obj), ' 3rd!', 2),
      mutateObjectAsync(takeSequential(obj), ' 4th!', 4),
      mutateObjectAsync(takeSequential(obj), ' 5th!', 10),
      mutateObjectAsync(takeSequential(obj), ' 6th!', 2),
      mutateObjectAsync(takeSequential(obj), ' 7th!', 2),
    ]);
    expect(obj.value).toEqual(
      'hello! mutated 3rd! mutated 6th! mutated 7th! mutated 1st! mutated 4th! mutated 2nd! mutated 5th!',
    );
  }),
);
