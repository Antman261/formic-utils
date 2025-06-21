import { isWeaklyNever } from '../never.ts';

type TimeUnit = 'ms' | 's' | 'mins' | 'hrs';
type Time = { to(targetUnit: TimeUnit): number };

export const time = (value: number, sourceUnit: TimeUnit): Time => {
  const valueMs = toMilliseconds(value, sourceUnit);
  return {
    to(targetUnit: TimeUnit) {
      if (sourceUnit === targetUnit) return value;
      const result = fromMillisecondsTo(valueMs, targetUnit);
      console.log({ value, valueMs, result, sourceUnit, targetUnit });
      return result;
    },
  };
};

function toMilliseconds(value: number, unit: TimeUnit): number {
  if (unit === 'ms') return value;
  if (unit === 's') return Math.ceil(value * 1000);
  if (unit === 'mins') return Math.ceil(value * 1000 * 60);
  if (unit === 'hrs') return Math.ceil(value * 1000 * 60 * 60);
  return isWeaklyNever(unit);
}

function fromMillisecondsTo(valueMs: number, unit: TimeUnit): number {
  if (unit === 'ms') return valueMs;
  if (unit === 's') return valueMs / 1000;
  if (unit === 'mins') return valueMs / 1000 / 60;
  if (unit === 'hrs') return valueMs / 1000 / 60 / 60;
  return isWeaklyNever(unit);
}
