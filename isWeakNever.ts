/**
 * Use these functions for exhaustive type checking, e.g. of switch statements or discriminated unions, ensuring all possible cases are handled at compile time.
 *
 * @example
 * ```ts
 * type Shape = Circle | Square;
 *
 * function getArea(shape: Shape): number {
 *   switch (shape.type) {
 *     case 'circle':
 *       return Math.PI * shape.radius ** 2;
 *     case 'square':
 *       return shape.width ** 2;
 *     default:
 *       // If an unexpected value is found at runtime, this will warn but not throw
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
 *       // This will throw an error if an unhandled case is encountered at runtime
 *       return isStrictlyNever(shape);
 *   }
 * }
 * ```
 */

/**
 * Weakly checks if a value is of type `never`, logging a warning if it is. Useful if you need compile-time type checking without throwing exceptions at runtime.
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
 *       // If an unexpected value is found at runtime, this will warn but not throw
 *       return isWeaklyNever(shape);
 *   }
 * }
 * ```
 */
export const isWeaklyNever = (v: never) => console.warn("Unexpected value:", v);

/**
 * Unlike `isWeaklyNever`, throws an exception if the value exists at runtime.
 *
 * @example
 * ```ts
 * function getPerimeter(shape: Shape): number {
 *   switch (shape.type) {
 *     case 'circle':
 *       return 2 * Math.PI * shape.radius;
 *     case 'square':
 *       return 4 * shape.width;
 *     default:
 *       // This will throw an error if an unhandled case is encountered at runtime
 *       return isStrictlyNever(shape);
 *   }
 * }
 * ```
 */
export const isStrictlyNever = (v: never): never => {
  throw new Error(`Unexpected value: ${v}`);
};
