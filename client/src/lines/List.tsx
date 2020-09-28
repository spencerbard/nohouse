import { green } from "@ant-design/colors";
import styled from "@emotion/styled";
import React from "react";
import dayjs from "../dayjs";
import { Line } from "../generated/graphql";
type TList = {
  lines: Line[];
};

function formatDate(dateStr: string): string {
  const dateDayjs = dayjs.unix(parseInt(dateStr, 10) / 1000);
  const date = dateDayjs.isSame(dayjs(), "d")
    ? "Today"
    : dateDayjs.format("ddd MMM Do");
  const time = dateDayjs.format("h:mm A");
  return `${date} ${time}`;
}

function formatPlus(val?: number | null): string {
  if (val == null) return "";
  return `${val > 0 ? "+" : ""}${val}`;
}

const LinesList = styled.div(() => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  "> table": {
    margin: "8px 0px 8px 0px",
  },
}));

const LineTable = styled.table(() => ({}));

const LineHeader = styled.thead(() => ({}));

const LineHeaderRow = styled.tr(() => ({}));

const LineHeaderItem = styled.th(() => ({}));

const LineBody = styled.tbody(() => ({}));

const LineRow = styled.tr(() => ({}));

const LineTeam = styled.td(() => ({
  width: "200px",
}));

const LineOdd = styled.td(() => ({
  width: "110px",
}));
const LineOddItem = styled.div(() => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid #f0f0f0",
  borderRadius: "2px",
  backgroundColor: "#f5f5f5",
  height: "45px",
  textAlign: "center",
}));

const LineOddValue = styled.div(() => ({
  fontWeight: 600,
}));

const LineOddVig = styled.div(() => ({
  color: green[5],
  fontWeight: 600,
}));

export default function List({ lines }: TList) {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div style={{ width: "530px" }}>
        Displaying {lines.length} lines for events starting within 48 hours.
        <LinesList>
          {lines.map((line) => {
            return (
              <LineTable key={line.uid}>
                <LineHeader>
                  <LineHeaderRow>
                    <LineHeaderItem>
                      {formatDate(line.event_start_time)}
                    </LineHeaderItem>
                    <LineHeaderItem style={{ textAlign: "center" }}>
                      Spread
                    </LineHeaderItem>
                    <LineHeaderItem style={{ textAlign: "center" }}>
                      Total
                    </LineHeaderItem>
                    <LineHeaderItem style={{ textAlign: "center" }}>
                      Moneyline
                    </LineHeaderItem>
                  </LineHeaderRow>
                </LineHeader>
                <LineBody>
                  <LineRow>
                    <LineTeam>{line.home_team}</LineTeam>
                    <LineOdd>
                      <LineOddItem>
                        <LineOddValue>
                          {formatPlus(line.spread_home)}
                        </LineOddValue>
                        <LineOddVig>
                          {formatPlus(line.spread_home_vig)}
                        </LineOddVig>
                      </LineOddItem>
                    </LineOdd>
                    <LineOdd>
                      <LineOddItem>
                        <LineOddValue>o{line.total}</LineOddValue>
                        <LineOddVig>
                          {formatPlus(line.total_over_vig)}
                        </LineOddVig>
                      </LineOddItem>
                    </LineOdd>
                    <LineOdd>
                      <LineOddItem>
                        <LineOddVig>{formatPlus(line.h2h_home)}</LineOddVig>
                      </LineOddItem>
                    </LineOdd>
                  </LineRow>
                  <LineRow>
                    <LineTeam>{line.away_team}</LineTeam>
                    <LineOdd>
                      <LineOddItem>
                        <LineOddValue>
                          {formatPlus(line.spread_away)}
                        </LineOddValue>
                        <LineOddVig>
                          {formatPlus(line.spread_away_vig)}
                        </LineOddVig>
                      </LineOddItem>
                    </LineOdd>
                    <LineOdd>
                      <LineOddItem>
                        <LineOddValue>u{line.total}</LineOddValue>
                        <LineOddVig>
                          {formatPlus(line.total_under_vig)}
                        </LineOddVig>
                      </LineOddItem>
                    </LineOdd>
                    <LineOdd>
                      <LineOddItem>
                        <LineOddVig>{formatPlus(line.h2h_away)}</LineOddVig>
                      </LineOddItem>
                    </LineOdd>
                  </LineRow>
                </LineBody>
              </LineTable>
            );
          })}
        </LinesList>
      </div>
    </div>
  );
}
