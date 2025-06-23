import { Numeric } from './NumericBase.ts';

export class UTinyInt extends Numeric<'UTinyInt'> {
  constructor(num: number, buffer?: ArrayBuffer, offset: number = 0) {
    super(num, 'UTinyInt', buffer, offset);
  }
}
export class STinyInt extends Numeric<'STinyInt'> {
  constructor(num: number, buffer?: ArrayBuffer, offset: number = 0) {
    super(num, 'STinyInt', buffer, offset);
  }
}
export class USmallInt extends Numeric<'USmallInt'> {
  constructor(num: number, buffer?: ArrayBuffer, offset: number = 0) {
    super(num, 'USmallInt', buffer, offset);
  }
}
export class SSmallInt extends Numeric<'SSmallInt'> {
  constructor(num: number, buffer?: ArrayBuffer, offset: number = 0) {
    super(num, 'SSmallInt', buffer, offset);
  }
}
export class UInt extends Numeric<'UInt'> {
  constructor(num: number, buffer?: ArrayBuffer, offset: number = 0) {
    super(num, 'UInt', buffer, offset);
  }
  /**
   * Number of bytes to store the numeric
   */
  static bytes = 4;
}

export class SInt extends Numeric<'SInt'> {
  constructor(num: number, buffer?: ArrayBuffer, offset: number = 0) {
    super(num, 'SInt', buffer, offset);
  }
}

/**
 * Use Float16 to preallocate memory, either to reduce memory alloc & dealloc, improving performance, or to reduce memory utilization, or both.
 *
 * When using multiple Floats, you can allocate memory in a single large buffer and then use Float16 as a view of a single value contained within that buffer by supplying the buffer as the second argument and the values offset within that buffer as the third argument.
 */
export class Float16 extends Numeric<'SmallFloat'> {
  constructor(num: number, buffer?: ArrayBuffer, offset: number = 0) {
    super(num, 'SmallFloat', buffer, offset);
  }
}
/**
 * Use Float32 to preallocate memory, either to reduce memory alloc & dealloc, improving performance, or to reduce memory utilization, or both.
 *
 * When using multiple Floats, you can allocate memory in a single large buffer and then use Float32 as a view of a single value contained within that buffer by supplying the buffer as the second argument and the values offset within that buffer as the third argument.
 */
export class Float32 extends Numeric<'Float'> {
  constructor(num: number, buffer?: ArrayBuffer, offset: number = 0) {
    super(num, 'Float', buffer, offset);
  }
}
/**
 * Use this wrapper around an element of a Float64Array when you need to store numbers in preallocated memory, such as for performance reasons.
 *
 * When using multiple Floats, you can allocate memory in a single large buffer and then use Float64 as a view of a single value contained within that buffer by supplying the buffer as the second argument and the values offset within that buffer as the third argument.
 */
export class Float64 extends Numeric<'BigFloat'> {
  constructor(num: number, buffer?: ArrayBuffer, offset: number = 0) {
    super(num, 'BigFloat', buffer, offset);
  }
}
// export class UBigInt extends Numeric<'UBigInt'> {
//   constructor(num: number, buffer?: ArrayBuffer, offset: number = 0) {
//     super(num, 'UBigInt', buffer, offset);
//   }
// }

// export class SBigInt extends Numeric<'SBigInt'> {
//   constructor(num: number, buffer?: ArrayBuffer, offset: number = 0) {
//     super(num, 'SBigInt', buffer, offset);
//   }
// }
