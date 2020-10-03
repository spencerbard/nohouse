import styled from "@emotion/styled";
import React from "react";
import LineMarket from "./LineMarket";
import OpenLines from "./OpenLines";
import { formatDate, LineMarket as ELineMarket, Selection } from "./utils";
import {
  Line as TLine,
  LineMarketSide as ELineMarketSide,
} from "../generated/graphql";

const Container = styled.div(() => ({
  border: "1px solid #f0f0f0",
  borderRadius: "8px",
  padding: "8px",
  paddingTop: "12px",
  width: "420px",
  maxWidth: "420px",
  boxShadow: "0 2px 4px rgba(154,160,185,.05), 0 8px 16px rgba(166,173,201,.2)",
}));

const LineInfoContainer = styled.div(() => ({
  display: "flex",
  justifyContent: "space-between",
}));

const InfoColumnDiv = styled.div(() => ({
  flex: "0 0 120px",
}));

const DateDiv = styled.div(() => ({
  fontWeight: 600,
  textAlign: "center",
  width: "100%",
  height: "25px",
  lineHeight: "25px",
}));

const TeamPadDiv = styled.div(() => ({
  height: "25px",
}));

const TeamDiv = styled.div(() => ({
  height: "47px",
  lineHeight: "47px",
  textOverflow: "ellipsis",
  overflow: "hidden",
}));

const LineMarketsDiv = styled.div(() => ({
  flex: 1,
  display: "flex",
  div: {
    marginLeft: "2px",
    marginRight: "2px",
  },
  "div:first-of-type": {
    marginRight: "2px",
  },
  "div:last-of-type": {
    marginLeft: "2px",
  },
}));

type LineProps = {
  line: TLine;
  handleClick?(selection: Selection): void;
  sideSelected?: ELineMarketSide;
  sideHighlight?: ELineMarketSide;
};

export default function Line({
  line,
  handleClick,
  sideSelected,
  sideHighlight,
}: LineProps) {
  return (
    <Container>
      <DateDiv>{formatDate(line.event_start_time)}</DateDiv>
      <LineInfoContainer>
        <InfoColumnDiv>
          <TeamPadDiv />
          <TeamDiv>{line.home_team}</TeamDiv>
          <TeamDiv>{line.away_team}</TeamDiv>
        </InfoColumnDiv>
        <LineMarketsDiv>
          {[ELineMarket.spread, ELineMarket.total, ELineMarket.h2h].map(
            (mkt) => (
              <LineMarket
                key={mkt}
                line={line}
                market={mkt}
                sideSelected={sideSelected}
                sideHighlight={sideHighlight}
                handleClick={handleClick}
              />
            )
          )}
        </LineMarketsDiv>
      </LineInfoContainer>
      {line.openLines != null && <OpenLines line={line} />}
    </Container>
  );
}
