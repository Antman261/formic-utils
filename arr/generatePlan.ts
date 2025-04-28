import type { Ops, Plan } from "./ArrFromTypes.ts";

export function generatePlan<T>(ops: Ops<T>[]): Plan<T> {
  const plan: Plan<T> = [];
  for (const op of ops) {
    const needsNewStep = plan.at(-1)?.map.length !== 0;
    if (needsNewStep) plan.push({ add: [], remove: [], map: [] });
    const opSet = plan.at(-1)!;
    if (op.kind === "add") opSet.add.push(...op.args);
    if (op.kind === "remove") opSet.remove.push(...op.args);
    if (op.kind === "map") opSet.map.push(...op.args);
  }
  return plan;
}
