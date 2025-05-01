/**
 * Use these functions for exhaustive type checking, e.g. of switch statements, discriminated unions, etc, ensuring all possible cases are handled at compile time.
 *
 * @example
 * ```ts
 * function getArea(shape: Shape): number {
 *   switch (shape.type) {
 *     case 'circle':
 *       return Math.PI * shape.radius ** 2;
 *     case 'square':
 *       return shape.width ** 2;
 *     default:
 *       // Logs a warning if an unexpected value is provided at runtime
 *       return isWeaklyNever(shape);
 *   }
 * }
 *
 * function getPerimeter(shape: Shape): number {
 *   switch (shape.type) {
 *     case 'circle':
 *       return 2 * Math.PI * shape.radius;
 *     case 'square':
 *       return 4 * shape.width;
 *     default:
 *       // Throws an error if an unhandled value is provided at runtime
 *       return isStrictlyNever(shape);
 *   }
 * }
 * ```
 */

/**
 * Weakly checks if a value is of type `never`, logging a warning if it is.
 * Useful for compile-time type checking without throwing exceptions at runtime.
 */
export const isWeaklyNever = (v: never): never => {
  console.warn("Unexpected value:", v);
  return v;
};

/**
 * Unlike `isWeaklyNever`, throws an exception if the value exists at runtime.
 */
export const isStrictlyNever = (v: never): never => {
  throw new Error(`Unexpected value: ${v}`);
};
