import { assertEquals } from "@std/assert";
import { callWith } from "./callWith.ts";

Deno.test("callWith: works with map", () =>
  assertEquals(
    [(c: string) => "a" + c, (c: string) => "b" + c].map(callWith("z")),
    ["az", "bz"]
  )
);
