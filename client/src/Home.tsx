import { gql, useQuery } from "@apollo/client";
import React from "react";
import { Line } from "./generated/graphql";
import LinesList from "./lines/List";

const GET_LINES = gql`
  query GetLines {
    lines {
      uid
      event_key
      sport_key
      home_team
      away_team
      event_start_time
      h2h_home
      h2h_away
      h2h_draw
      spread_home
      spread_away
      spread_home_vig
      spread_away_vig
      total
      total_over_vig
      total_under_vig
      load_uid
      created_at
    }
  }
`;

export default function Home() {
  const { data, error, loading } = useQuery<{ lines: Line[] }>(GET_LINES);
  return <div>{!loading && data && <LinesList lines={data.lines} />}</div>;
}
