const mutableDescriptor = Object.create(null);
mutableDescriptor.value = 'm';
const _borrow: unique symbol = Symbol('borrow-kind');

Deno.bench(
  'Just defining an object',
  () => {
    const _foo = { v: 'a' };
  },
);
Deno.bench(
  'Just calling Object.create(null)',
  () => {
    const _foo = Object.create(null);
  },
);

const foo = { v: 'a' };
Deno.bench(
  'Avoiding redefining identical properties on an object',
  () => {
    // @ts-expect-error ok
    if (foo[_borrow] !== 'm') Object.defineProperty(foo, _borrow, mutableDescriptor);
  },
);
const foo2 = { v: 'a' };
Deno.bench(
  'Redefining identical properties on an object',
  () => {
    Object.defineProperty(foo2, _borrow, mutableDescriptor);
  },
);

Deno.bench(
  'Defining non-enumerable properties with static descriptor object created using Object.create(null);',
  () => {
    const foo = { v: 'a' };
    Object.defineProperty(foo, _borrow, mutableDescriptor);
  },
);

Deno.bench(
  'Defining non-enumerable properties with fresh descriptor object created using Object.create(null)',
  () => {
    const foo = { v: 'a' };
    const desc = Object.create(null);
    desc.value = 'm';
    Object.defineProperty(foo, _borrow, desc);
  },
);

Deno.bench(
  'Defining non-enumerable properties with explicit literal descriptor object',
  () => {
    const foo = { v: 'a' };
    Object.defineProperty(foo, _borrow, { value: 'm' });
  },
);
