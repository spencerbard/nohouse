import knex from "../db";
import { SportsRowRead } from "../generated/database";

export async function getSports(): Promise<SportsRowRead[]> {
  return await knex("sports").select("*");
}
