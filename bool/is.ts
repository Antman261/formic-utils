/**
 * Check if the parameter is assigned a value other than undefined.
 *
 * Use to improve readability and defend against common mistakes such as `if (!!x)` where it is unclear if the author intended for the check to fail when x is 0 or -0
 */
export const isDefined = <T extends unknown>(x: T | undefined): boolean => x !== undefined;
/**
 * Check if the parameter is strictly undefined.
 *
 * Use to improve readability and defend against common mistakes such as `if (!x) return;` where it is unclear if the author intended to return early when x is 0 or -0
 */
export const isUndefined = <T extends unknown>(x: T | undefined): boolean => x === undefined;
/**
 * Check if the parameter coerces to true.
 *
 * Use to improve readability and defend against common mistakes such as `if (!x) return;` where it is unclear if the author intended to return early when x is 0 or -0
 */
export const isTrue = <T extends unknown>(x: T | undefined): boolean => !!x === true;
/**
 * Check if the parameter coerces to true.
 *
 * Use to improve readability and defend against common mistakes such as `if (!x) return;` where it is unclear if the author intended to return early when x is 0 or -0
 */
export const isFalse = <T extends unknown>(x: T | undefined): boolean => !!x === false;
