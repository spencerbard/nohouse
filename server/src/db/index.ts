import Knex from "knex";

const knex = Knex({
  client: "postgres",
  connection: {
    host: "127.0.0.1",
    user: "api",
    password: "32&b5J!Z&aze",
    database: "nohouse",
  },
  pool: { min: 2, max: 10 },
});

export default knex as Knex;
