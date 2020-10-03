import { green } from "@ant-design/colors";
import styled from "@emotion/styled";
import React from "react";
import { Line, LineMarketSide as ELineMarketSide } from "../generated/graphql";
import {
  formatPlus,
  isH2hSide,
  isTotalSide,
  isSpreadSide,
  makeVigKey,
} from "./utils";

interface ContainerDivProps {
  canClick: boolean;
  selected: boolean;
  highlight: boolean;
  lowlight: boolean;
}

const ContainerDiv = styled.div<ContainerDivProps>(
  ({ canClick, selected, highlight, lowlight }) => ({
    width: "100%",
    cursor: canClick ? "pointer" : "default",
    userSelect: "none",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #f0f0f0",
    borderRadius: "2px",
    backgroundColor: selected ? "#d9d9d9" : lowlight ? "#595959" : "#f5f5f5",
    opacity: !selected && lowlight ? 0.15 : 1,
    height: "45px",
    textAlign: "center",
    "&:hover": canClick
      ? {
          backgroundColor: "#d9d9d9",
        }
      : null,
  })
);

const ValueDiv = styled.div(() => ({
  fontWeight: 600,
}));

const VigDiv = styled.div(() => ({
  color: green[5],
  fontWeight: 600,
}));

type LineMarketSideProps = {
  line: Line;
  side: ELineMarketSide;
  sideSelected?: ELineMarketSide;
  sideHighlight?: ELineMarketSide;
  handleClick?({ line, side }: { line: Line; side: ELineMarketSide }): void;
};

export default function LineMarketSide({
  line,
  side,
  sideSelected,
  sideHighlight,
  handleClick,
}: LineMarketSideProps) {
  const onClick = () => {
    if (handleClick) handleClick({ line, side });
  };
  return (
    <ContainerDiv
      onClick={onClick}
      canClick={!!handleClick}
      selected={sideSelected === side}
      highlight={Boolean(sideHighlight && sideHighlight === side)}
      lowlight={Boolean(sideHighlight != null && sideHighlight !== side)}
    >
      {isH2hSide(side) && <VigDiv>{formatPlus(line[side])}</VigDiv>}
      {isTotalSide(side) && (
        <>
          <ValueDiv>{formatPlus(line.total)}</ValueDiv>
          <VigDiv>{formatPlus(line[makeVigKey(side)])}</VigDiv>
        </>
      )}
      {isSpreadSide(side) && (
        <>
          <ValueDiv>{formatPlus(line[side])}</ValueDiv>
          <VigDiv>{formatPlus(line[makeVigKey(side)])}</VigDiv>
        </>
      )}
    </ContainerDiv>
  );
}
