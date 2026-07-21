import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  parse
} from "graphql";

export function schema() {
  const BlogImage = new GraphQLObjectType({
    name: "Image",
    fields: {
      url: {
        type: GraphQLString,
        resolve: (image) => { throw new Error("STUB"); }
      },
      width: {
        type: GraphQLInt,
        resolve: (image) => { throw new Error("STUB"); }
      },
      height: {
        type: GraphQLInt,
        resolve: (image) => { throw new Error("STUB"); }
      }
    }
  });

  const BlogAuthor = new GraphQLObjectType({
    name: "Author",
    fields: () => { throw new Error("STUB"); }
  });

  const BlogArticle: GraphQLObjectType = new GraphQLObjectType({
    name: "Article",
    fields: {
      id: {
        type: new GraphQLNonNull(GraphQLID),
        resolve: (article) => { throw new Error("STUB"); }
      },
      isPublished: {
        type: GraphQLBoolean,
        resolve: (article) => { throw new Error("STUB"); }
      },
      author: { type: BlogAuthor },
      title: {
        type: GraphQLString,
        resolve: (article) => { throw new Error("STUB"); }
      },
      body: {
        type: GraphQLString,
        resolve: (article) => { throw new Error("STUB"); }
      },
      keywords: {
        type: new GraphQLList(GraphQLString),
        resolve: (article) => { throw new Error("STUB"); }
      }
    }
  });

  const BlogQuery = new GraphQLObjectType({
    name: "Query",
    fields: {
      article: {
        type: BlogArticle,
        args: { id: { type: GraphQLID } },
        resolve: (_, { id }) => { throw new Error("STUB"); }
      },
      feed: {
        type: new GraphQLList(BlogArticle),
        resolve: () =>
          { throw new Error("STUB"); }
      }
    }
  });

  const johnSmith = {
    id: 123,
    name: "John Smith",
    pic: (width: number, height: number) => { throw new Error("STUB"); },
    recentArticle: null
  };
  johnSmith.recentArticle = article(1);

  function article(id: number): any {
    return {
      id,
      isPublished: true,
      author: johnSmith,
      title: "My Article " + id,
      body: "This is a post",
      hidden: "This data is not exposed in the schema",
      keywords: ["foo", "bar", 1, true, null]
    };
  }

  function getPic(uid: number, width: number, height: number) {
    return {
      url: `cdn://${uid}`,
      width: `${width}`,
      height: `${height}`
    };
  }

  return new GraphQLSchema({
    query: BlogQuery
  });
}

export const query = parse(`
query ($id: ID! = "1", $width: Int = 640, $height: Int = 480) {
  feed {
    __typename
    id,
    title
  },
  article(id: $id) {
    ...articleFields,
    author {
      __typename
      id,
      name,
      pic(width: $width, height: $height) {
      __typename
        url,
        width,
        height
      },
      articles {
        ...articleFields,
        keywords,
        badges {
          color, text
        },
        adverts {
          text,
          image {
            url,
            width,
            height
          }
        }
      }
    }
  }
}

fragment articleFields on Article {
  __typename
  id,
  isPublished,
  title,
  body,
  hidden,
  notdefined
}
`);
