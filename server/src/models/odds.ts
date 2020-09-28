import knex from "../db";
import { LinesHistoryRowRead, SportsRowRead } from "../generated/database";

export async function getSports(): Promise<SportsRowRead[]> {
  return await knex("sports").select("*");
}

export async function getLines(): Promise<LinesHistoryRowRead[]> {
  return await knex("lines_current")
    .select("*")
    .whereRaw(
      "event_start_time BETWEEN (NOW() - INTERVAL '10 minutes')::timestamp AND (NOW() + INTERVAL '48 hours')::timestamp"
    )
    .orderBy("event_start_time");
}
