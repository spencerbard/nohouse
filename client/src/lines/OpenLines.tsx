import { green, red } from "@ant-design/colors";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import styled from "@emotion/styled";
import { Tooltip, Typography } from "antd";
import React from "react";
import { useAcceptUserLine } from "./gql";
import { formatPlus, isH2hSide, isTotalSide } from "./utils";
import {
  Line,
  LineMarketSide,
  UserLine,
  UserLineAcceptInput,
} from "../generated/graphql";

const OpenLinesContainer = styled.div(() => ({
  marginTop: "8px",
  width: "100%",
}));

const OpenLinesHeader = styled.div(({ onClick }) => ({
  width: "100%",
  height: "25px",
  cursor: onClick ? "pointer" : "default",
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  userSelect: "none",
}));

type OpenLineItemsContainerProps = {
  isExpanded: boolean;
  openLines: UserLine[];
};

const OpenLineItemsContainer = styled.div<OpenLineItemsContainerProps>(
  ({ isExpanded, openLines }) => ({
    maxHeight: isExpanded ? `${openLines.length * 78 + 25}px` : "0px",
    transition: ".3s all",
    overflow: "hidden",
    width: "100%",
  })
);

const OpenLineItemsTable = styled.table(() => ({
  width: "100%",
  th: {
    textAlign: "center",
  },
  td: {
    textAlign: "center",
  },
}));

const OpenLineItemRow = styled.tr(() => ({
  cursor: "pointer",
  "&:hover": {
    backgroundColor: "#d9d9d9",
  },
}));

function getAcceptorSide(
  line: Line,
  openLine: UserLine
): { side: LineMarketSide; sideStr: string; vig: number; oppVig: number } {
  const map = {
    [LineMarketSide.TotalOver]: LineMarketSide.TotalUnder,
    [LineMarketSide.TotalUnder]: LineMarketSide.TotalOver,
    [LineMarketSide.SpreadHome]: LineMarketSide.SpreadAway,
    [LineMarketSide.SpreadAway]: LineMarketSide.SpreadHome,
    [LineMarketSide.H2hHome]: LineMarketSide.H2hAway,
    [LineMarketSide.H2hAway]: LineMarketSide.H2hHome,
  };
  let side: LineMarketSide;
  let sideStr: string;
  let vig: number;
  let oppVig: number;
  if (isTotalSide(openLine.creator_side)) {
    const isOver = openLine.creator_side === LineMarketSide.TotalUnder;
    side = isOver ? LineMarketSide.TotalOver : LineMarketSide.TotalUnder;
    sideStr = `${isOver ? "o" : "u"}${line.total}`;
    vig = isOver ? line.total_over_vig : line.total_under_vig;
    oppVig = isOver ? line.total_under_vig : line.total_over_vig;
  } else if (isH2hSide(openLine.creator_side)) {
    const isHome = openLine.creator_side === LineMarketSide.H2hAway;
    side = isHome ? LineMarketSide.H2hHome : LineMarketSide.H2hAway;
    sideStr = isHome ? line.home_team : line.away_team;
    vig = isHome ? line.h2h_home : line.h2h_away;
    oppVig = isHome ? line.h2h_away : line.h2h_home;
  } else {
    const isHome = openLine.creator_side === LineMarketSide.SpreadAway;
    const team = isHome ? line.home_team : line.away_team;
    const spread = isHome ? line.spread_home : line.spread_away;
    side = isHome ? LineMarketSide.SpreadHome : LineMarketSide.SpreadAway;
    sideStr = `${team} ${formatPlus(spread)}`;
    vig = isHome ? line.spread_home_vig : line.spread_away_vig;
    oppVig = isHome ? line.spread_away_vig : line.spread_home_vig;
  }
  return {
    side,
    sideStr,
    vig,
    oppVig,
  };
}

function getPotentialProfit({
  amount,
  vig,
}: {
  amount: number;
  vig: number;
}): number {
  if (vig < 0) return amount / ((-1 * vig) / 100);
  return (amount * vig) / 100;
}

function toDollars(qty: number): string {
  return `$${qty.toFixed(2)}`;
}

function isOpenUserLine(userLine: UserLine | null): userLine is UserLine {
  return userLine != null && !userLine.accepted_at;
}

type OpenLinesProps = {
  line: Line;
};

export default function OpenLines({ line }: OpenLinesProps) {
  const [userLineAccept] = useAcceptUserLine();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const toggleExpanded = () => setIsExpanded(!isExpanded);
  const openLines: UserLine[] = line.openLines?.filter(isOpenUserLine) ?? [];
  function handleAccept(userLineAcceptInput: UserLineAcceptInput) {
    userLineAccept({ variables: { userLineAcceptInput } });
  }

  return (
    <OpenLinesContainer>
      <OpenLinesHeader onClick={openLines.length ? toggleExpanded : undefined}>
        {!openLines.length ? (
          <Typography.Text>No Open Lines</Typography.Text>
        ) : (
          <Typography.Link underline>
            {isExpanded ? "Hide" : "View"} {openLines.length} Open Lines{" "}
            {isExpanded ? <UpOutlined /> : <DownOutlined />}
          </Typography.Link>
        )}
      </OpenLinesHeader>
      <OpenLineItemsContainer isExpanded={isExpanded} openLines={openLines}>
        <OpenLineItemsTable>
          <thead>
            <tr>
              <th>Opponent</th>
              <th>Your Side</th>
              <th style={{ width: "85px" }}>Pot. Loss</th>
              <th style={{ width: "85px" }}>Pot. Profit</th>
            </tr>
          </thead>
          <tbody>
            {openLines.map((openLine) => {
              const { side, sideStr, vig, oppVig } = getAcceptorSide(
                line,
                openLine
              );
              return (
                <Tooltip key={openLine.uid} title="Click to accept">
                  <OpenLineItemRow
                    onClick={() =>
                      handleAccept({
                        user_line_uid: openLine.uid,
                        acceptor_side: side,
                      })
                    }
                  >
                    <td>{openLine.creator.name}</td>
                    <td>{`${sideStr} @ ${formatPlus(vig)}`}</td>
                    <td style={{ width: "85px", color: red[5] }}>
                      {toDollars(
                        getPotentialProfit({
                          amount: openLine.amount,
                          vig: oppVig,
                        })
                      )}
                    </td>
                    <td
                      style={{
                        width: "85px",
                        color: green[5],
                        fontWeight: 600,
                      }}
                    >
                      {toDollars(
                        getPotentialProfit({ amount: openLine.amount, vig })
                      )}
                    </td>
                  </OpenLineItemRow>
                </Tooltip>
              );
            })}
          </tbody>
        </OpenLineItemsTable>
      </OpenLineItemsContainer>
    </OpenLinesContainer>
  );
}
