import styled from "@emotion/styled";
import React from "react";
import { Line, LineMarketSide as ELineMarketSide } from "../generated/graphql";
import LineMarketSide from "./LineMarketSide";
import {
  getSidesForMarket,
  LineMarket as ELineMarket,
  Selection,
} from "./utils";

const Container = styled.div(() => ({
  display: "flex",
  flexDirection: "column",
  width: "100%",
}));

const MarketDiv = styled.div(() => ({
  width: "100%",
  fontWeight: 600,
  height: "25px",
  textAlign: "center",
  lineHeight: "25px",
  marginLeft: "4px !important",
}));

const SidesDiv = styled.div(() => ({
  width: "100%",
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  "div:first-of-type": {
    marginBottom: "2px",
  },
}));

type LineMarketProps = {
  line: Line;
  market: ELineMarket;
  marketHighlight?: ELineMarket;
  sideSelected?: ELineMarketSide;
  sideHighlight?: ELineMarketSide;
  handleClick?(sel: Selection): void;
};

export default function LineMarket({
  line,
  market,
  sideSelected,
  marketHighlight,
  sideHighlight,
  handleClick,
}: LineMarketProps) {
  return (
    <Container>
      <MarketDiv>{market.toUpperCase()}</MarketDiv>
      <SidesDiv>
        {getSidesForMarket(market).map((side) => (
          <LineMarketSide
            key={side}
            line={line}
            side={side}
            sideSelected={sideSelected}
            sideHighlight={sideHighlight}
            handleClick={handleClick}
          />
        ))}
      </SidesDiv>
    </Container>
  );
}
