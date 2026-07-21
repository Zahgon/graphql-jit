import { genFn } from "./generate";
import {
  doTypesOverlap,
  type FieldNode,
  type GraphQLCompositeType,
  GraphQLError,
  GraphQLInterfaceType,
  type GraphQLNamedType,
  GraphQLObjectType,
  type GraphQLOutputType,
  type GraphQLResolveInfo,
  GraphQLSchema,
  isAbstractType,
  isCompositeType,
  isListType,
  isNonNullType,
  isObjectType,
  isUnionType,
  Kind,
  type SelectionSetNode
} from "graphql";
import memoize from "lodash.memoize";
import mergeWith from "lodash.mergewith";
import { memoize2, memoize4 } from "./memoize.js";

// TODO(boopathi): Use negated types to express
// Enrichments<T> = { [key in (string & not keyof GraphQLResolveInfo)]: T[key] }
// in TypeScript 3.5
// https://github.com/Microsoft/TypeScript/pull/29317
export type GraphQLJitResolveInfo<Enrichments> = GraphQLResolveInfo &
  Enrichments;

export interface ResolveInfoEnricherInput {
  schema: GraphQLResolveInfo["schema"];
  fragments: GraphQLResolveInfo["fragments"];
  operation: GraphQLResolveInfo["operation"];
  parentType: GraphQLObjectType;
  returnType: GraphQLOutputType;
  fieldName: string;
  fieldNodes: FieldNode[];
}

export interface FieldExpansion {
  // The possible return types that the field can return
  // It includes all the types in the Schema that intersect with the actual return type
  [returnType: string]: TypeExpansion;
}

const LeafFieldSymbol = Symbol("LeafFieldSymbol");

export interface LeafField {
  [LeafFieldSymbol]: true;
}

export interface TypeExpansion {
  // The fields that are requested in the Query for a particular type
  // `true` indicates a leaf node
  [fieldName: string]: FieldExpansion | LeafField;
}

function createLeafField<T extends object>(props: T): T & LeafField {
    throw new Error("STUB");
}

export function isLeafField(obj: LeafField | FieldExpansion): obj is LeafField {
    throw new Error("STUB");
}

/**
 * Compute the GraphQLJitResolveInfo's `fieldExpansion` and return a function
 * that returns the computed resolveInfo. This thunk is registered in
 * context.dependencies for the field's resolveInfoName
 */
export function createResolveInfoThunk<T>(
  {
    schema,
    fragments,
    operation,
    parentType,
    fieldName,
    fieldType,
    fieldNodes
  }: {
    schema: GraphQLResolveInfo["schema"];
    fragments: GraphQLResolveInfo["fragments"];
    operation: GraphQLResolveInfo["operation"];
    parentType: GraphQLObjectType;
    fieldType: GraphQLOutputType;
    fieldName: string;
    fieldNodes: FieldNode[];
  },
  enricher?: (inp: ResolveInfoEnricherInput) => T
) {
  let enrichedInfo = {};
  if (typeof enricher === "function") {
    enrichedInfo =
      enricher({
        fieldName,
        fieldNodes,
        returnType: fieldType,
        parentType,
        schema,
        fragments,
        operation
      }) || {};
    if (typeof enrichedInfo !== "object" || Array.isArray(enrichedInfo)) {
      enrichedInfo = {};
    }
  }
  const gen = genFn();
  gen(`return function getGraphQLResolveInfo(rootValue, variableValues, path) {
      return {
          fieldName,
          fieldNodes,
          returnType: fieldType,
          parentType,
          path,
          schema,
          fragments,
          rootValue,
          operation,
          variableValues,`);
  Object.keys(enrichedInfo).forEach((key) => {
      throw new Error("STUB");
  });
  gen(`};};`);
  // eslint-disable-next-line
  return new Function(
    "fieldName",
    "fieldNodes",
    "fieldType",
    "parentType",
    "schema",
    "fragments",
    "operation",
    "enrichedInfo",
    gen.toString()
  ).call(
    null,
    fieldName,
    fieldNodes,
    fieldType,
    parentType,
    schema,
    fragments,
    operation,
    enrichedInfo
  );
}

export function fieldExpansionEnricher(input: ResolveInfoEnricherInput) {
    throw new Error("STUB");
}

type FragmentsType = GraphQLResolveInfo["fragments"];
type GraphQLNamedOutputType = GraphQLNamedType & GraphQLOutputType;
type GraphQLObjectLike = GraphQLInterfaceType | GraphQLObjectType;

const MEMOIZATION = true;

const memoizedGetReturnType = MEMOIZATION
  ? memoize2(getReturnType)
  : getReturnType;
const memoizedHasField = MEMOIZATION ? memoize2(hasField) : hasField;
const memoizedResolveEndType = MEMOIZATION
  ? memoize(resolveEndType)
  : resolveEndType;
const memoizedGetPossibleTypes = MEMOIZATION
  ? memoize2(getPossibleTypes)
  : getPossibleTypes;
const memoizedExpandFieldNodeType = MEMOIZATION
  ? memoize4(expandFieldNodeType)
  : expandFieldNodeType;
const memoizedExpandFieldNode = MEMOIZATION
  ? memoize4(expandFieldNode)
  : expandFieldNode;

function expandFieldNode(
  schema: GraphQLSchema,
  fragments: FragmentsType,
  node: FieldNode,
  fieldType: GraphQLOutputType
): FieldExpansion | LeafField {
    throw new Error("STUB");
}

function expandFieldNodeType(
  schema: GraphQLSchema,
  fragments: FragmentsType,
  parentType: GraphQLCompositeType,
  selectionSet: SelectionSetNode
): TypeExpansion {
    throw new Error("STUB");
}

/**
 * Returns a list of Possible types that one can get to from the
 * resolvedType. As an analogy, these are the same types that one
 * can use in a fragment's typeCondition.
 *
 * Note: This is different from schema.getPossibleTypes() that this
 * returns all possible types and not just the ones from the type definition.
 *
 * Example:
 * interface Node {
 *   id: ID!
 * }
 * type User implements Node {
 *   id: ID!
 *   name: String
 * }
 * type Article implements Node {
 *   id: ID!
 *   title: String
 * }
 * union Card = User | Article
 *
 * - schema.getPossibleTypes(Card) would give [User, Article]
 * - This function getPossibleTypes(schema, Card) would give [User, Article, Node]
 *
 */
function getPossibleTypes(
  schema: GraphQLSchema,
  compositeType: GraphQLCompositeType
) {
  if (isObjectType(compositeType)) {
    return [compositeType];
  }

  const possibleTypes: GraphQLCompositeType[] = [];
  const types = schema.getTypeMap();
  for (const typeName in types) {
    if (Object.prototype.hasOwnProperty.call(types, typeName)) {
      const typ = types[typeName];
      if (isCompositeType(typ) && doTypesOverlap(schema, typ, compositeType)) {
        possibleTypes.push(typ);
      }
    }
  }

  return possibleTypes;
}

/**
 * Given an (Object|Interface)Type, and a fieldName, find the
 * appropriate `end` return type for the field in the Composite Type.
 *
 * Note: The `end` return type is the type by unwrapping non-null types
 * and list types. Check `resolveEndType`
 */
function getReturnType(
  parentType: GraphQLObjectLike,
  fieldName: string
): GraphQLNamedOutputType {
    throw new Error("STUB");
}

/**
 * Resolve to the end type of the Output type unwrapping non-null types and lists
 */
function resolveEndType(typ: GraphQLOutputType): GraphQLNamedOutputType {
    throw new Error("STUB");
}

function hasField(typ: GraphQLObjectLike, fieldName: string) {
    throw new Error("STUB");
}

// This is because lodash does not support merging keys
// which are symbols. We require them for leaf fields
function deepMerge<TObject, TSource>(obj: TObject, src: TSource) {
    throw new Error("STUB");
}
