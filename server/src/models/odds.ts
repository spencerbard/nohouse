import knex from "../db";
import {
  line_market_side,
  LinesHistoryRowRead,
  SportsRowRead,
  UserLinesRowRead,
  UserLinesRowWrite,
} from "../generated/database";

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

export async function listLinesHistoryByUids(
  uids: string[]
): Promise<LinesHistoryRowRead[]> {
  return await knex.table("lines_current").select("*").whereIn("uid", uids);
}

export async function createUserLine(
  userLine: UserLinesRowWrite
): Promise<UserLinesRowRead> {
  const [row] = await knex("user_lines").insert(userLine, "*");
  return row;
}

export async function acceptUserLine({
  userLineUid,
  acceptorUid,
  acceptorSide,
}: {
  userLineUid: string;
  acceptorUid: string;
  acceptorSide: line_market_side;
}): Promise<UserLinesRowRead> {
  const [row] = await knex("user_lines")
    .update(
      {
        acceptor_uid: acceptorUid,
        acceptor_side: acceptorSide,
        accepted_at: knex.raw("NOW()"),
      },
      "*"
    )
    .where("uid", userLineUid);
  return row;
}

export async function listUserLinesByUids(
  uids: string[]
): Promise<UserLinesRowRead[]> {
  return await knex
    .table("user_lines")
    .select("*")
    .whereIn("uid", uids)
    .whereNull("deleted_at");
}

export async function listOpenUserLines(
  lineUid?: string
): Promise<UserLinesRowRead[]> {
  const query = knex
    .select("user_lines.*")
    .from("user_lines")
    .join("lines_history", (join) =>
      join.on("user_lines.line_uid", "=", "lines_history.uid")
    )
    .whereRaw(
      "lines_history.event_start_time BETWEEN (NOW() - INTERVAL '10 minutes')::timestamp AND (NOW() + INTERVAL '48 hours')::timestamp"
    )
    .orderBy("lines_history.event_start_time")
    .orderBy("user_lines.created_at")
    .whereNull("accepted_at")
    .whereNull("deleted_at");
  if (lineUid) {
    query.where("lines_history.uid", lineUid);
  }
  return await query;
}
