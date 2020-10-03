// Update with your config settings.
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
module.exports = {
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
