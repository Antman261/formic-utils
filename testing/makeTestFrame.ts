import { mockSessionAsync } from '@std/testing/mock';

type DenoTestFunc = (denoContext: Deno.TestContext) => void | Promise<void>;
type FrameFunc = () => unknown | Promise<unknown>;
type FrameOpt = { beforeEach?: FrameFunc; afterEach?: FrameFunc; beforeAll?: FrameFunc };
type TestFunc = (runTest: DenoTestFunc) => DenoTestFunc;

export const makeTestFrame = (opt?: FrameOpt): TestFunc => {
  opt?.beforeAll?.();
  return (runTest: DenoTestFunc): DenoTestFunc => async (denoContext) => {
    try {
      await mockSessionAsync(async () => {
        await opt?.beforeEach?.();
        await runTest(denoContext);
      })();
    } finally {
      await opt?.afterEach?.();
    }
  };
};
