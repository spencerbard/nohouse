import Knex from "knex";
// @ts-ignore
import * as knexfile from "./knexfile.js";

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

type Env = "production" | "development" | "staging";

console.log(process.env.NODE_ENV);

const env: Env =
  process.env.NODE_ENV &&
  ["production", "development", "staging"].includes(process.env.NODE_ENV)
    ? (process.env.NODE_ENV as Env)
    : "development";

const config: Knex.Config = (knexfile as any)[env];
export default Knex(config);
