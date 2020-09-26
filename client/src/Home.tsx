import { gql, useQuery } from "@apollo/client";
import React from "react";
import Select, { ValueType } from "react-select";
import { Sport } from "./generated/graphql";

const GET_SPORTS = gql`
  query GetSports {
    sports {
      key
      active
      group
      details
      title
      has_outrights
    }
  }
`;

type SportOption = {
  label: string;
  value: Sport;
};

export default function Home() {
  const [
    sportOptionSelected,
    setSportOptionSelected,
  ] = React.useState<SportOption | null>(null);
  const { data, error, loading } = useQuery<{ sports: Sport[] }>(GET_SPORTS);
  const sportOptions: SportOption[] = React.useMemo(() => {
    if (!data?.sports) {
      return [];
    }
    return data?.sports
      .map((sport) => ({
        label: sport.title,
        value: sport,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [data]);

  const handleChange = (opts: any) => {};

  return (
    <div>
      <Select<SportOption>
        options={sportOptions}
        onChange={(option: ValueType<SportOption>) =>
          setSportOptionSelected(option ? (option as SportOption) : null)
        }
        value={sportOptionSelected}
      />
    </div>
  );
}
