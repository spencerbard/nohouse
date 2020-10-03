import cors from "cors";
import DataLoader from "dataloader";
import express from "express";
import { GraphQLScalarType, GraphQLSchema, Kind } from "graphql";
import depthLimit from "graphql-depth-limit";
import { IResolvers, makeExecutableSchema } from "graphql-tools";
import { createServer } from "http";
import * as OddsModel from "../models/odds";
import * as UserModel from "../models/users";
import createLoaders from "./dataloaders";
import {
  LinesHistoryRowRead,
  line_market_side,
  UserLinesRowRead,
} from "../generated/database";
import {
  CurrentUser,
  Line,
  LineMarketSide,
  Sport,
  User,
  UserLine,
  UserLineInput,
  UserLoginInput,
  UserLineAcceptInput,
  UserSignupInput,
} from "../generated/graphql";
import {
  ApolloServer,
  gql,
  UserInputError,
  AuthenticationError,
  ForbiddenError,
} from "apollo-server-express";

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
    openLines: [UserLine]
  }

  type Mutation {
    userSignup(userSignupInput: UserSignupInput!): CurrentUser
    userLogin(userLoginInput: UserLoginInput!): CurrentUser
    userLoginToken(token: String!): CurrentUser
    userLineCreate(userLineInput: UserLineInput!): UserLine!
    userLineAccept(userLineAcceptInput: UserLineAcceptInput!): UserLine!
  }

  input UserLineAcceptInput {
    user_line_uid: String!
    acceptor_side: LineMarketSide!
  }

  enum LineMarketSide {
    spread_home
    spread_away
    total_over
    total_under
    h2h_home
    h2h_away
  }

  type UserLine {
    uid: String!
    line_uid: String!
    amount: Int!
    creator_uid: String!
    created_at: String!
    creator_side: LineMarketSide!
    acceptor_uid: String
    accepted_at: String
    acceptor_side: LineMarketSide
    deleted_at: String
    line: Line!
    creator: User!
    acceptor: User
  }

  input UserLineInput {
    line_uid: String!
    amount: Int!
    creator_side: LineMarketSide!
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
    openLines: [UserLine]
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
    lines: async (): Promise<Line[]> => {
      return await OddsModel.getLines();
    },
    openLines: async (_parent, _q, { user, loaders }) => {
      if (!user) {
        throw new ForbiddenError("User must be logged in to view this.");
      }
      return await OddsModel.listOpenUserLines();
    },
  },
  UserLine: {
    line: async (userLine: UserLinesRowRead, _q, { loaders }) => {
      return loaders.lines.load(userLine.line_uid);
    },
    acceptor: async (userLine: UserLinesRowRead, _q, { loaders }) => {
      return userLine.acceptor_uid
        ? loaders.users.load(userLine.acceptor_uid)
        : null;
    },
    creator: async (userLine: UserLinesRowRead, _q, { loaders }) => {
      return loaders.users.load(userLine.creator_uid);
    },
  },
  Line: {
    openLines: async (line: LinesHistoryRowRead) => {
      return await OddsModel.listOpenUserLines(line.uid);
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
        throw new UserInputError("User does not exist.");
      }
      if (!(await UserModel.comparePassword(existingUser, password))) {
        throw new UserInputError("Password does not match.");
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
        throw new UserInputError("User with email already exists.");
      }
      const newUser = await UserModel.create(userSignupInput);
      return {
        uid: newUser.uid,
        name: newUser.name,
        email: newUser.email,
        token: UserModel.encodeToken(newUser),
      };
    },
    userLineCreate: async function (
      _,
      { userLineInput }: { userLineInput: UserLineInput },
      { user, loaders }
    ): Promise<UserLine> {
      if (!user) {
        throw new ForbiddenError("User must be logged in to create line.");
      }
      const userLine: UserLinesRowRead = await OddsModel.createUserLine({
        ...userLineInput,
        creator_side: (userLineInput.creator_side as any) as line_market_side,
        creator_uid: user.uid,
      });
      return {
        ...userLine,
        creator_side: (userLine.creator_side as any) as LineMarketSide,
        acceptor_side: (userLine.acceptor_side as any) as LineMarketSide,
        creator: loaders.users.load(user.uid),
        acceptor: null,
        line: loaders.lines.load(userLine.line_uid),
      };
    },
    userLineAccept: async function (
      _,
      { userLineAcceptInput }: { userLineAcceptInput: UserLineAcceptInput },
      { user, loaders }
    ) {
      if (!user) {
        throw new ForbiddenError("User must be logged in to accept line.");
      }
      const userLine: UserLinesRowRead = await OddsModel.acceptUserLine({
        acceptorSide: (userLineAcceptInput.acceptor_side as any) as line_market_side,
        acceptorUid: user.uid,
        userLineUid: userLineAcceptInput.user_line_uid,
      });
      return {
        ...userLine,
        creator_side: (userLine.creator_side as any) as LineMarketSide,
        acceptor_side: (userLine.acceptor_side as any) as LineMarketSide,
        creator: loaders.users.load(userLine.creator_uid),
        acceptor: loaders.users.load(user.uid),
        line: loaders.lines.load(userLine.line_uid),
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
    return {
      user,
      tzoffset: req.headers.tzoffset,
      loaders: createLoaders(),
    };
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
