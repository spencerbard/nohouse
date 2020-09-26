import { ApolloServer, gql, UserInputError } from "apollo-server-express";
import cors from "cors";
import express from "express";
import { GraphQLSchema } from "graphql";
import depthLimit from "graphql-depth-limit";
import "graphql-import-node";
import { IResolvers, makeExecutableSchema } from "graphql-tools";
import { createServer } from "http";
import * as OddsModel from "../models/odds";
import * as UserModel from "../models/users";
import {
  CurrentUser,
  User,
  UserLoginInput,
  UserSignupInput,
  Sport,
} from "../generated/graphql";

const typeDefs = gql`
  type Query {
    odds(sport: String!): String
    sports: [Sport]
  }

  type Mutation {
    userSignup(userSignupInput: UserSignupInput!): CurrentUser
    userLogin(userLoginInput: UserLoginInput!): CurrentUser
    userLoginToken(token: String!): CurrentUser
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
  Query: {
    odds: () => "gotem",
    sports: async (): Promise<Sport[]> => {
      return await OddsModel.getSports();
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
      const user: User = UserModel.decodeToken(token);
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
    return { user };
  },
});
app.use("*", cors());
server.applyMiddleware({ app, path: "/graphql" });
const httpServer = createServer(app);
httpServer.listen({ port: 4000 }, (): void =>
  console.log(
    `\n🚀      GraphQL is now running on http://localhost:4000/graphql`
  )
);
