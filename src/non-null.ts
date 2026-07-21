import {
  type ExecutionResult,
  type FieldNode,
  type GraphQLError,
  type GraphQLType,
  isListType,
  isNonNullType,
  isObjectType,
  isAbstractType
} from "graphql";
import merge from "lodash.merge";
import { collectFields, collectSubfields, resolveFieldDef } from "./ast.js";
import { getOperationRootType } from "./compat.js";
import { type CompilationContext } from "./execution.js";

interface QueryMetadata {
  isNullable: boolean;
  children: { [key: string]: QueryMetadata };
}

export type NullTrimmer = (data: any, errors: GraphQLError[]) => any;

/**
 *
 * @param {CompilationContext} compilationContext
 * @returns {(data: any, errors: GraphQLError[]) => {data: any; errors: GraphQLError[]}}
 */
export function createNullTrimmer(
  compilationContext: CompilationContext
): NullTrimmer {
  return trimData(parseQueryNullables(compilationContext));
}

/**
 * Trims a data response according to the field errors in non null fields.
 *
 * Errors are filtered to ensure a single field error per field.
 *
 * @param {QueryMetadata} nullable Description of the query and their nullability
 * @returns {(data: any, errors: GraphQLError[]) => {data: any; errors: GraphQLError[]}}
 * the trimmed data and a filtered list of errors.
 */
function trimData(nullable: QueryMetadata): NullTrimmer {
  return (data: any, errors: GraphQLError[]): ExecutionResult => {
      throw new Error("STUB");
  };
}

/**
 * Removes a branch out of the response data by mutating the original object.
 *
 * @param tree response data
 * @param {Array<number | string>} branch array with the path that should be trimmed
 */
function removeBranch(tree: any, branch: Array<number | string>): void {
  for (let i = 0; i < branch.length - 1; ++i) {
    // if ancestor has already been removed, there's nothing to do
    if (tree[branch[i]] === null) {
      return;
    }
    tree = tree[branch[i]];
  }
  const toNull = branch[branch.length - 1];
  tree[toNull] = null;
}

/**
 * Name of the child used in array to contain the description.
 *
 * Only used for list to contain the child description.
 */
const ARRAY_CHILD_NAME = "index";

/**
 *
 * @param {QueryMetadata} nullable Description of the query and their nullability
 * @param {ReadonlyArray<string | number>} paths path of the error location
 * @returns {Array<string | number>} path of the branch to be made null
 */
function findNullableAncestor(
  nullable: QueryMetadata,
  paths: ReadonlyArray<string | number>
): Array<string | number> {
  let lastNullable = 0;
  for (let i = 0; i < paths.length; ++i) {
    const path = paths[i];
    const child =
      nullable.children[typeof path === "string" ? path : ARRAY_CHILD_NAME];
    if (!child) {
      // Stopping the search since we reached a leaf node,
      // the loop should be on its final iteration
      break;
    }
    if (child.isNullable) {
      lastNullable = i + 1;
    }
    nullable = child;
  }
  return paths.slice(0, lastNullable);
}

/**
 * Produce a description of the query regarding its nullability.
 *
 * Leaf nodes are not present in this representation since they are not
 * interesting for removing branches of the response tree.
 *
 * The structure is recursive like the query.
 * @param {CompilationContext} compilationContext Execution content
 * @returns {QueryMetadata} description of the query
 */
function parseQueryNullables(
  compilationContext: CompilationContext
): QueryMetadata {
  const type = getOperationRootType(
    compilationContext.schema,
    compilationContext.operation
  );
  const fields = collectFields(
    compilationContext,
    type,
    compilationContext.operation.selectionSet,
    Object.create(null),
    Object.create(null)
  );
  const properties = Object.create(null);
  for (const responseName of Object.keys(fields)) {
    const fieldType = resolveFieldDef(
      compilationContext,
      type,
      fields[responseName]
    );
    if (!fieldType) {
      // if field does not exist, it should be ignored for compatibility concerns.
      // Usually, validation would stop it before getting here but this could be an old query
      continue;
    }
    const property = transformNode(
      compilationContext,
      fields[responseName],
      fieldType.type
    );
    if (property != null) {
      properties[responseName] = property;
    }
  }
  return {
    isNullable: true,
    children: properties
  };
}

/**
 * Processes a single node to produce a description of itself and its children.
 *
 * Leaf nodes are ignore and removed from the description
 * @param {CompilationContext} compilationContext
 * @param {FieldNode[]} fieldNodes list of fields
 * @param {GraphQLType} type Current type being processed.
 * @returns {QueryMetadata | null} null if node is a leaf, otherwise a description of the node and its children.
 */
function transformNode(
  compilationContext: CompilationContext,
  fieldNodes: FieldNode[],
  type: GraphQLType
): QueryMetadata | null {
  if (isNonNullType(type)) {
    const nullable = transformNode(compilationContext, fieldNodes, type.ofType);
    if (nullable != null) {
      nullable.isNullable = false;
      return nullable;
    }
    return null;
  }
  if (isObjectType(type)) {
    const subfields = collectSubfields(compilationContext, type, fieldNodes);
    const properties = Object.create(null);
    for (const responseName of Object.keys(subfields)) {
      const fieldType = resolveFieldDef(
        compilationContext,
        type,
        subfields[responseName]
      );
      if (!fieldType) {
        // if field does not exist, it should be ignored for compatibility concerns.
        // Usually, validation would stop it before getting here but this could be an old query
        continue;
      }
      const property = transformNode(
        compilationContext,
        subfields[responseName],
        fieldType.type
      );
      if (property != null) {
        properties[responseName] = property;
      }
    }
    return {
      isNullable: true,
      children: properties
    };
  }
  if (isListType(type)) {
    const child = transformNode(compilationContext, fieldNodes, type.ofType);
    if (child != null) {
      return {
        isNullable: true,
        children: { [ARRAY_CHILD_NAME]: child }
      };
    }

    return {
      isNullable: true,
      children: {}
    };
  }
  if (isAbstractType(type)) {
    return compilationContext.schema.getPossibleTypes(type).reduce(
      (res, t) => {
            throw new Error("STUB");
        },
      {
        isNullable: true,
        children: {}
      }
    );
  }

  // Scalars and enum are ignored since they are leaf values
  return null;
}
