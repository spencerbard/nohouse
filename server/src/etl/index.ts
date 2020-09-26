import axios from "axios";
import knex from "../db";
import { SportsRowWrite } from "../generated/database";
import { ODDS_API_KEY } from "../secrets";

const BASE_URL = "https://api.the-odds-api.com/v3";

enum EOverUnder {
  over = "over",
  under = "under",
}

type TTotal = {
  points: number[];
  odds: number[];
  position: EOverUnder[];
};

type TSpread = {
  odds: number[];
  points: string[];
};

type TSiteOdd = {
  spreads?: TSpread;
  h2h?: number[];
  totals?: TTotal;
};

type TSite = {
  site_key: string;
  site_nice: string;
  last_update: number;
  odds: TSiteOdd;
};

type TOdd = {
  sport_key: string;
  sport_nice: string;
  teams: string[];
  commence_time: number;
  home_team: string;
  sites: TSite[];
  sites_count: number;
};

enum ERoute {
  sports = "sports",
  odds = "odds",
}

enum ERegion {
  au = "au",
  uk = "uk",
  eu = "eu",
  us = "us",
}

enum EMarket {
  h2h = "h2h",
  spreads = "spreads",
  totals = "totals",
}

enum EDateFormat {
  unix = "unix",
  iso = "iso",
}

async function makeRequest({
  route,
  params = {},
}: {
  route: ERoute;
  params?: TOddsParams | {};
}) {
  const resp = await axios.get(`${BASE_URL}/${route}`, {
    params: { api_key: ODDS_API_KEY, ...params },
  });
  return resp.data.data;
}

async function getSports(): Promise<SportsRowWrite[]> {
  return await makeRequest({ route: ERoute.sports });
}

type TOddsParams = { sport: string; region: ERegion; mkt: EMarket };

async function getOdds(params: TOddsParams): Promise<TOdd[]> {
  return await makeRequest({ route: ERoute.odds, params });
}

async function writeSportsToDB() {
  const sports = await getSports();
  const sportsRows = await knex("sports").insert(sports, "*");
  return sportsRows;
}

async function writeOddsHistoryToDB() {
  const oddsRows = [];
  const sports = [
    "americanfootball_ncaaf",
    "americanfootball_nfl",
    "baseball_mlb",
    "basketball_nba",
  ];
  for (const sport of sports) {
    for (const mkt of [EMarket.h2h, EMarket.spreads, EMarket.totals]) {
      const odds = await getOdds({ sport, region: ERegion.us, mkt });
      const oddsInputs = odds.map((odd) => {
        const away_team = odd.teams.find((team) => team !== odd.home_team);
        return {
          event_key: `${odd.sport_key}-${odd.home_team}-${away_team}-${odd.commence_time}`,
          sport_key: odd.sport_key,
          sport_nice: odd.sport_nice,
          commence_time: odd.commence_time,
          home_team: odd.home_team,
          away_team,
          teams: JSON.stringify(odd.teams),
          sites: JSON.stringify(odd.sites),
          sites_count: odd.sites_count,
          market: mkt,
        };
      });
      oddsRows.push(...(await knex("odds_history").insert(oddsInputs, "*")));
    }
  }
  return oddsRows;
}

writeOddsHistoryToDB()
  .then((rows) => {
    console.log(rows);
    return;
  })
  .finally(() => process.exit());
