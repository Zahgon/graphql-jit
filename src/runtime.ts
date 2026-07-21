import { type ExecutionContext } from "./execution";

type Serializer = (
  c: ExecutionContext,
  v: any,
  onError: any,
  ...idx: number[]
) => any;

function resolvePromise(
  ctx: ExecutionContext,
  promise: Promise<unknown>,
  onSuccess: (result: unknown) => void,
  onError: (err: unknown) => void
): void {
  ++ctx.promiseCounter;
  promise.then(
    (result) => {
          throw new Error("STUB");
      },
    (err) => {
        throw new Error("STUB");
    }
  );
}

export const jitRuntime = {
  isPromise(value: unknown): boolean {
    return (
      value != null &&
      typeof value === "object" &&
      typeof (value as any).then === "function"
    );
  },

  checkNonNullLeaf(
    ctx: ExecutionContext,
    value: unknown,
    dest: any[],
    nullMsg: string,
    locs: any,
    path: any,
    capStack: boolean,
    serialize: Serializer,
    errHandler: any,
    ...parentIndexes: number[]
  ): any {
      throw new Error("STUB");
  },

  checkNullableLeaf(
    ctx: ExecutionContext,
    value: unknown,
    dest: any[],
    locs: any,
    path: any,
    capStack: boolean,
    serialize: Serializer,
    errHandler: any,
    ...parentIndexes: number[]
  ): any {
      throw new Error("STUB");
  },

  callResolver(
    ctx: ExecutionContext,
    call: () => unknown,
    onSuccess: (result: unknown) => void,
    onError: (err: unknown) => void
  ): void {
      throw new Error("STUB");
  },

  handleResolverResult(
    ctx: ExecutionContext,
    value: unknown,
    onSuccess: (result: unknown) => void,
    onError: (err: unknown) => void
  ): void {
    if (this.isPromise(value)) {
      resolvePromise(ctx, value as Promise<unknown>, onSuccess, onError);
    } else {
      onSuccess(value);
    }
  },

  handleListItemResult(
    ctx: ExecutionContext,
    item: unknown,
    onSuccess: (result: unknown) => void,
    onError: (err: unknown) => void
  ): void {
      throw new Error("STUB");
  },

  finalizeResult(ctx: ExecutionContext): Promise<unknown> | undefined {
      throw new Error("STUB");
  },

  safeMap(
    ctx: ExecutionContext,
    iterable: Iterable<unknown> | string,
    cb: (
      context: ExecutionContext,
      a: unknown,
      index: number,
      resultArray: unknown[],
      ...idx: number[]
    ) => void,
    ...idx: number[]
  ): unknown[] {
      throw new Error("STUB");
  }
};

export type JitRuntime = typeof jitRuntime;
