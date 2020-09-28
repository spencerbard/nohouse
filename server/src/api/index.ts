import cors from "cors";
import express from "express";
import { GraphQLScalarType, GraphQLSchema, Kind } from "graphql";
import depthLimit from "graphql-depth-limit";
import { IResolvers, makeExecutableSchema } from "graphql-tools";
import { createServer } from "http";
import * as OddsModel from "../models/odds";
import * as UserModel from "../models/users";
import {
  ApolloServer,
  gql,
  UserInputError,
  AuthenticationError,
} from "apollo-server-express";
import {
  CurrentUser,
  User,
  UserLoginInput,
  UserSignupInput,
  Line,
  Sport,
} from "../generated/graphql";

const customFloat = new GraphQLScalarType({
  name: "CustomFloat",
  description: "Handles Postgres NaN",
  serialize(value) {
    return isNaN(value) ? null : value;
  },
  parseValue(value) {
    return value == null ? NaN : value;
  },
  parseLiteral(ast) {
    return Kind.FLOAT;
  },
});

const typeDefs = gql`
  scalar CustomFloat

  type Query {
    lines: [Line]
    odds(sport: String!): String
    sports: [Sport]
  }

  type Mutation {
    userSignup(userSignupInput: UserSignupInput!): CurrentUser
    userLogin(userLoginInput: UserLoginInput!): CurrentUser
    userLoginToken(token: String!): CurrentUser
  }

  type Line {
    uid: String!
    event_key: String!
    sport_key: String!
    home_team: String!
    away_team: String!
    event_start_time: String!
    h2h_home: CustomFloat
    h2h_away: CustomFloat
    h2h_draw: CustomFloat
    spread_home: CustomFloat
    spread_away: CustomFloat
    spread_home_vig: CustomFloat
    spread_away_vig: CustomFloat
    total: CustomFloat
    total_over_vig: CustomFloat
    total_under_vig: CustomFloat
    load_uid: String!
    created_at: String!
  }

  type Sport {
    key: String!
    active: Boolean!
    group: String!
    details: String!
    title: String!
    has_outrights: Boolean!
    created_at: String!
  }

  type User {
    uid: String!
    name: String!
    email: String!
  }

  type CurrentUser {
    uid: String!
    name: String!
    email: String!
    token: String!
  }

  input UserSignupInput {
    name: String!
    email: String!
    password: String!
  }

  input UserLoginInput {
    email: String!
    password: String!
  }
`;

const resolvers: IResolvers = {
  CustomFloat: customFloat,
  Query: {
    odds: () => "gotem",
    sports: async (): Promise<Sport[]> => {
      return await OddsModel.getSports();
    },
    lines: async (): Promise<Line[]> => {
      return await OddsModel.getLines();
    },
  },
  Mutation: {
    userLogin: async function (
      _,
      { userLoginInput }: { userLoginInput: UserLoginInput }
    ): Promise<CurrentUser> {
      const { email, password } = userLoginInput;
      const existingUser = await UserModel.getByEmail(email);
      if (!existingUser) {
        throw new UserInputError(`
          User does not exist.
        `);
      }
      if (!(await UserModel.comparePassword(existingUser, password))) {
        throw new UserInputError(`Sorry that password doesn't match.`);
      }
      return {
        ...existingUser,
        token: UserModel.encodeToken(existingUser),
      };
    },
    userLoginToken: function (_, { token }: { token: string }): CurrentUser {
      const user: User | null = UserModel.decodeToken(token);
      if (!user) {
        throw new AuthenticationError("Token is invalid.");
      }
      return { uid: user.uid, name: user.name, email: user.email, token };
    },
    userSignup: async function (
      _,
      { userSignupInput }: { userSignupInput: UserSignupInput }
    ): Promise<CurrentUser> {
      const existingUser = await UserModel.getByEmail(userSignupInput.email);
      if (!!existingUser) {
        throw new UserInputError(`User with email already exists.`);
      }
      const newUser = await UserModel.create(userSignupInput);
      return {
        uid: newUser.uid,
        name: newUser.name,
        email: newUser.email,
        token: UserModel.encodeToken(newUser),
      };
    },
  },
};

const schema: GraphQLSchema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const app = express();

const server = new ApolloServer({
  schema,
  validationRules: [depthLimit(7)],
  context: async ({ req }) => {
    // Get the user token from the headers.
    const token = req.headers.authorization;
    // try to retrieve a user with the token
    const user = token
      ? await UserModel.getByToken(token.replace("Bearer ", ""))
      : null;

    // add the user to the context
    return { user, tzoffset: req.headers.tzoffset };
  },
  introspection: true,
});
app.use("*", cors());
server.applyMiddleware({ app, path: "/graphql" });
const httpServer = createServer(app);
const port = process.env.PORT || 4000;
httpServer.listen({ port }, (): void =>
  console.log(
    `\n🚀      GraphQL is now running on http://localhost:${port}/graphql`
  )
);
