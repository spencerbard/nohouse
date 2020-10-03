import styled from "@emotion/styled";
import React from "react";
import CreateUserLine from "./CreateUserLine";
import { useLines } from "./gql";
import LineItem from "./Line";
import { Selection } from "./utils";

const LinesList = styled.div(() => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  "> div": {
    margin: "8px 0px 8px 0px",
  },
}));

export default function Home() {
  const { data, loading } = useLines();
  const [selection, setSelection] = React.useState<Selection>();
  const lines = data?.lines || [];

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      {selection && (
        <CreateUserLine
          selection={selection}
          handleCancel={() => setSelection(undefined)}
        />
      )}
      <div style={{ width: "530px" }}>
        {Boolean(!loading && lines.length > 0) && (
          <LinesList>
            {lines.map((line) => (
              <LineItem key={line.uid} line={line} handleClick={setSelection} />
            ))}
          </LinesList>
        )}
      </div>
    </div>
  );
}
