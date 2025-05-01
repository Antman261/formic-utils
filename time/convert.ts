type TimeUnit = "ms" | "s" | "mins" | "hrs";

export const time = {
  convert: (value: number, unit: TimeUnit) => {
    const valueMs = toMilliseconds(value, unit);
    return {
      to(unit: TimeUnit) {
        return fromMillisecondsTo(valueMs, unit);
      },
    };
  },
};

function toMilliseconds(value: number, unit: TimeUnit): number {
  if (unit === "ms") return value;
  const seconds = value * 1000;
  if (unit === "s") return seconds;
  const minutes = seconds * 60;
  if (unit === "mins") return minutes;
  const hours = minutes * 60;
  if (unit === "hrs") return hours;
  return hours;
}

function fromMillisecondsTo(valueMs: number, unit: TimeUnit): number {
  if (unit === "ms") return valueMs;
  const seconds = valueMs / 1000;
  if (unit === "s") return seconds;
  const minutes = seconds / 60;
  if (unit === "mins") return minutes;
  const hours = minutes / 60;
  if (unit === "hrs") return hours;
  return hours;
}
