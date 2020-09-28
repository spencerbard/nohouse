import Knex from "knex";
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

type Env = "production" | "development" | "staging";

const configs: { [key in Env]: Knex.Config } = {
  development: {
    client: "postgresql",
    connection: {
      host: "127.0.0.1",
      user: "api",
      password: "32&b5J!Z&aze",
      database: "nohouse",
    },
  },

  staging: {
    client: "postgresql",
    connection: {
      host: "127.0.0.1",
      user: "api",
      password: "32&b5J!Z&aze",
      database: "nohouse",
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
  },

  production: {
    client: "postgresql",
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
  },
};

console.log(process.env.NODE_ENV);

const env: Env =
  process.env.NODE_ENV &&
  ["production", "development", "staging"].includes(process.env.NODE_ENV)
    ? (process.env.NODE_ENV as Env)
    : "development";

const config: Knex.Config = configs[env];
export default Knex(config);
