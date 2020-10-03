import dayjs from "../dayjs";
import { Line, LineMarketSide } from "../generated/graphql";

export type Selection = { line: Line; side: LineMarketSide };

export enum LineMarket {
  spread = "spread",
  total = "total",
  h2h = "h2h",
}

export function getSidesForMarket(
  market: LineMarket
): [LineMarketSide, LineMarketSide] {
  switch (market) {
    case LineMarket.spread:
      return [LineMarketSide.SpreadHome, LineMarketSide.SpreadAway];
    case LineMarket.total:
      return [LineMarketSide.TotalOver, LineMarketSide.TotalUnder];
    case LineMarket.h2h:
      return [LineMarketSide.H2hHome, LineMarketSide.H2hAway];
  }
}

export function formatDate(dateStr: string): string {
  const dateDayjs = dayjs.unix(parseInt(dateStr, 10) / 1000);
  const date = dateDayjs.isSame(dayjs(), "d")
    ? "Today"
    : dateDayjs.format("ddd MMM Do");
  const time = dateDayjs.format("h:mm A");
  return `${date} ${time}`;
}

export function formatPlus(val?: number | null): string {
  if (val == null) return "";
  return `${val > 0 ? "+" : ""}${val}`;
}

export function makeTitle(line: Line): string {
  return `${line.home_team} vs. ${line.away_team}
  ${formatDate(line.event_start_time)}`;
}

export function isH2hSide(
  side: LineMarketSide
): side is LineMarketSide.H2hHome | LineMarketSide.H2hAway {
  return [LineMarketSide.H2hHome, LineMarketSide.H2hAway].includes(side);
}

export function isTotalSide(
  side: LineMarketSide
): side is LineMarketSide.TotalOver | LineMarketSide.TotalUnder {
  return [LineMarketSide.TotalOver, LineMarketSide.TotalUnder].includes(side);
}

export function isSpreadSide(
  side: LineMarketSide
): side is LineMarketSide.SpreadHome | LineMarketSide.SpreadAway {
  return [LineMarketSide.SpreadHome, LineMarketSide.SpreadAway].includes(side);
}

export function makeVigKey(
  side:
    | LineMarketSide.TotalOver
    | LineMarketSide.TotalUnder
    | LineMarketSide.SpreadAway
    | LineMarketSide.SpreadHome
) {
  switch (side) {
    case LineMarketSide.TotalOver:
      return "total_over_vig";
    case LineMarketSide.TotalUnder:
      return "total_under_vig";
    case LineMarketSide.SpreadAway:
      return "spread_away_vig";
    case LineMarketSide.SpreadHome:
      return "spread_home_vig";
  }
}
