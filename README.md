# Formic Utils

A collection of diverse utility functions for TypeScript/Deno projects.

## Installation

```bash
deno add @jsr:@antman/formic-utils
```

## Features

- **Array Utilities** (`arr.ts`): Fluent interface for composing a series of array operations into a single highly-optimized operation.
- **Function Composition** (`compose.ts`): Higher order function helpers.
- **Call With** (`callWith.ts`): Useful for occasions like `callbacks.forEach(callWith(event))`
- **Type Utilities**:
  - `OfUnion.ts`: Extract type from union
  - `never.ts`: Includes `isWeaklyNever` & `isStrictlyNever`
  - `Func.ts`: Generic function `type (...args: never[]) => unknown`
- `withDebugLogging.ts`
- `memoise.ts`
