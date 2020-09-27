import axios from "axios";
import * as uuid from "uuid";
import dayjs from "../dayjs";
import knex from "../db";
import { ODDS_API_KEY } from "../secrets";
import {
  OddsHistoryRowRead,
  SportsRowWrite,
  LinesHistoryRowWrite,
} from "../generated/database";

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

type EventOdds = { [key in EMarket]: OddsHistoryRowRead };

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
  const load_uid = uuid.v4();
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
          load_uid,
        };
      });
      oddsRows.push(...(await knex("odds_history").insert(oddsInputs, "*")));
    }
  }
  return oddsRows;
}

function toRealSpread(spread: number): number {
  return (Math.ceil(spread) + Math.floor(spread)) / 2;
}

function sum(arr: number[]): number {
  return arr.reduce((sumVar, num) => {
    sumVar += num;
    return sumVar;
  }, 0);
}

function median(nums: Array<number>): number {
  nums = nums.sort();
  const midCeil = Math.ceil(nums.length / 2);
  const midFloor = Math.floor(nums.length / 2);
  if (nums.length % 2 !== 0) {
    return nums[midCeil];
  }
  return (nums[midCeil] + nums[midFloor]) / 2;
}

function decOddsToUS(odd: number): number {
  return odd >= 2 ? (odd - 1) * 100 : 100 / (1 - odd);
}

function decOddsToImpProbs<T extends number[]>(odds: T): T {
  const usOdds = odds.map(decOddsToUS);
  const impProbs = usOdds.map((odd) =>
    odd > 0 ? 100 / (odd + 100) : Math.abs(odd) / (Math.abs(odd) + 100)
  );
  return impProbs as T;
}

function devigOdds(odds: number[]): number[] {
  const impProbs = decOddsToImpProbs(odds);
  const impProbSum = sum(impProbs);
  return impProbs.map((impProb) => decOddsToUS(1 / (impProb / impProbSum)));
}

function calcSpreads(sites: TSite[]): number | null {
  const spreads = sites.reduce((spreadArr, curSite) => {
    const odds = curSite.odds?.spreads?.odds ?? [];
    const points = curSite.odds?.spreads?.points ?? [];
    if (odds?.length === 2 && points?.length === 2) {
      const impProbs = decOddsToImpProbs(odds);
      spreadArr.push(Math.abs(impProbs[0] * 2 * parseFloat(points[0])));
      spreadArr.push(Math.abs(impProbs[1] * 2 * parseFloat(points[1])));
    }
    return spreadArr;
  }, [] as Array<number>);
  if (!spreads.length) {
    return null;
  }
  return median(spreads);
}

function calcH2H(sites: TSite[]): Array<number> | null {
  if (!sites) {
    return null;
  }
  type H2HGrouper = {
    0: Array<number>;
    1: Array<number>;
    draw?: Array<number>;
  };
  const h2hs: H2HGrouper = sites.reduce(
    (h2h, curSite) => {
      const odds = curSite?.odds?.h2h;
      if (odds && odds.length >= 2) {
        h2h[0].push(odds[0]);
        h2h[1].push(odds[1]);
        if (odds.length === 3) {
          if (!h2h.hasOwnProperty("draw")) {
            h2h["draw"] = [];
          }
          h2h.draw?.push(odds[2]);
        }
      }
      return h2h;
    },
    { 0: [], 1: [] } as H2HGrouper
  );
  return devigOdds(
    [median(h2hs[0]), median(h2hs[1])].concat(
      h2hs.draw ? [median(h2hs.draw)] : []
    )
  );
}

function calcTotal(sites: TSite[]) {
  const totals = [];
  for (const site of sites) {
    const odds = site?.odds?.totals?.odds;
    const points = site?.odds?.totals?.points;
    if (odds?.length === 2 && points?.length === 2) {
      const impProbs = decOddsToImpProbs(odds);
      totals.push(points[0] * impProbs[0] + points[1] * impProbs[1]);
    }
  }
  return median(totals);
}

function calcVig(val: number): number {
  const expVal = toRealSpread(val);
  return decOddsToUS(
    1 / (0.5 + (val > 0 ? (val - expVal) / expVal : (expVal - val) / expVal))
  );
}

function calcSpreadVigs(spreads: [number, number]): [number, number] {
  return spreads.map(calcVig) as [number, number];
}

async function writeLinesHistoryToDB() {
  const linesRows: LinesHistoryRowWrite[] = [];
  const oddsAll = await knex("odds_history")
    .select("odds_history.*")
    .leftJoin("lines_history", (join) =>
      join
        .on("odds_history.event_key", "=", "lines_history.event_key")
        .on("odds_history.load_uid", "=", "lines_history.load_uid")
    )
    .whereNull("lines_history.uid");

  const oddsGrouped: {
    [key: string]: EventOdds;
  } = oddsAll.reduce((grouped, curOdds) => {
    const key = `${curOdds.event_key}-${curOdds.load_uid}`;
    if (!grouped.hasOwnProperty(key)) {
      grouped[key] = {};
    }
    grouped[key][curOdds.market] = curOdds;
    return grouped;
  }, {});
  for (const eventOdds of Object.values(oddsGrouped)) {
    const eventOddsBase = Object.values(eventOdds)[0];
    const total = calcTotal(eventOdds?.totals?.sites);
    const total_over_vig = Math.round(calcVig(total));
    const total_under_vig = -1 * total_over_vig;
    const h2hs = calcH2H(eventOdds?.h2h?.sites);
    const spread = calcSpreads(eventOdds?.spreads?.sites);
    const spreads: [number, number] | null =
      h2hs && spread
        ? h2hs[0] < h2hs[1]
          ? [-spread, spread]
          : [spread, -spread]
        : null;
    const spreadVigs = spreads ? calcSpreadVigs(spreads) : null;
    const homeIdx = eventOddsBase.teams.indexOf(eventOddsBase.home_team);
    const awayIdx = eventOddsBase.teams.indexOf(eventOddsBase.away_team);
    linesRows.push({
      event_key: eventOddsBase.event_key,
      sport_key: eventOddsBase.sport_key,
      home_team: eventOddsBase.home_team,
      away_team: eventOddsBase.away_team,
      event_start_time: dayjs.unix(eventOddsBase.commence_time).toDate(),
      h2h_home: h2hs ? Math.round(h2hs[homeIdx]) : null,
      h2h_away: h2hs ? Math.round(h2hs[awayIdx]) : null,
      h2h_draw: h2hs && "draw" in h2hs ? Math.round(h2hs["draw"]) : null,
      spread_home: spreads ? toRealSpread(spreads[homeIdx]) : null,
      spread_away: spreads ? toRealSpread(spreads[awayIdx]) : null,
      spread_home_vig: spreadVigs ? Math.round(spreadVigs[homeIdx]) : null,
      spread_away_vig: spreadVigs ? Math.round(spreadVigs[awayIdx]) : null,
      total: toRealSpread(total),
      total_over_vig,
      total_under_vig,
      load_uid: eventOddsBase.load_uid,
    });
  }
  console.log(linesRows);
  const lineRowsRead = await knex("lines_history").insert(linesRows, "*");
  return lineRowsRead;
}

function writeSports() {
  writeSportsToDB()
    .then((rows) => console.log(rows))
    .finally(() => process.exit());
}

function writeOdds() {
  writeOddsHistoryToDB()
    .then((rows) => console.log(rows))
    .finally(() => process.exit());
}

function writeLines() {
  writeLinesHistoryToDB()
    .then((rows) => console.log(rows))
    .finally(() => process.exit());
}

function main() {
  const func = process.argv[2];
  console.log(func);
  switch (func) {
    case "sports":
      return writeSports();
    case "odds":
      return writeOdds();
    case "lines":
      return writeLines();
    default:
      console.log("invalid cmd");
  }
}

main();
