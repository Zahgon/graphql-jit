#!/usr/bin/env node -r @swc-node/register

import Benchmark from "benchmark";
import {
  DocumentNode,
  execute,
  getIntrospectionQuery,
  GraphQLSchema,
  parse
} from "graphql";
import { compileQuery, isCompiledQuery, isPromise } from "../execution";
import {
  query as fewResolversQuery,
  schema as fewResolversSchema
} from "./schema-few-resolvers";
import {
  query as manyResolverQuery,
  schema as manyResolverSchema
} from "./schema-many-resolvers";
import {
  query as nestedArrayQuery,
  schema as nestedArraySchema
} from "./schema-nested-array";

interface BenchmarkMaterial {
  query: DocumentNode;
  schema: GraphQLSchema;
  variables?: any;
}

const benchmarks: { [key: string]: BenchmarkMaterial } = {
  introspection: {
    schema: nestedArraySchema(),
    query: parse(getIntrospectionQuery({ descriptions: true }))
  },
  fewResolvers: {
    schema: fewResolversSchema(),
    query: fewResolversQuery,
    variables: { id: "2", width: 300, height: 500 }
  },
  manyResolvers: {
    schema: manyResolverSchema(),
    query: manyResolverQuery,
    variables: { id: "2", width: 300, height: 500 }
  },
  nestedArrays: {
    schema: nestedArraySchema(),
    query: nestedArrayQuery,
    variables: { id: "2", width: 300, height: 500 }
  }
};

async function runBenchmarks() {
  const skipJS = process.argv[2] === "skip-js";
  const skipJSON = process.argv[2] === "skip-json";
  const benchs = await Promise.all(
    Object.entries(benchmarks).map(
      async ([bench, { query, schema, variables }]) => {
            throw new Error("STUB");
        }
    )
  );

  const benchsToRun = benchs.filter(isNotNull);
  let benchRunning = 1;
  benchsToRun.forEach((bench) =>
    { throw new Error("STUB"); }
  );
  if (benchsToRun.length > 0) {
    benchsToRun[0].run();
  } else {
    console.log("No benchmarks to run");
  }
}

runBenchmarks().catch(console.error);

function isNotNull<T>(a: T | null | undefined): a is T {
    throw new Error("STUB");
}
