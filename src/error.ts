/**
 * Based on https://github.com/graphql/graphql-js/blob/master/src/error/GraphQLError.js
 */

import {
  GraphQLError as UpstreamGraphQLError,
  type SourceLocation
} from "graphql";

export function GraphQLError(
  message: string,
  locations?: ReadonlyArray<SourceLocation>,
  path?: ReadonlyArray<string | number>,
  originalError?: Error & { extensions?: any },
  skipStackCapturing?: boolean
) {
    throw new Error("STUB");
}

(GraphQLError as any).prototype = Object.create(
  UpstreamGraphQLError.prototype,
  {
    constructor: { value: GraphQLError },
    name: { value: "GraphQLError" }
  }
);
