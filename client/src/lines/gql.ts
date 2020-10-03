import { gql, useMutation, useQuery } from "@apollo/client";
import {
  Line,
  UserLine,
  UserLineInput,
  UserLineAcceptInput,
} from "../generated/graphql";

const OPEN_LINE_FRAGMENT = gql`
  fragment UserLineFragment on UserLine {
    uid
    amount
    creator {
      uid
      name
    }
    acceptor {
      uid
      name
    }
    accepted_at
    acceptor_side
    created_at
    creator_side
  }
`;

const LINE_FRAGMENT = gql`
  fragment LineFragment on Line {
    uid
    event_key
    sport_key
    home_team
    away_team
    event_start_time
    h2h_home
    h2h_away
    h2h_draw
    spread_home
    spread_away
    spread_home_vig
    spread_away_vig
    total
    total_over_vig
    total_under_vig
    load_uid
    created_at
    openLines {
      ...UserLineFragment
    }
  }
  ${OPEN_LINE_FRAGMENT}
`;

const GET_LINES = gql`
  query GetLines {
    lines {
      ...LineFragment
    }
  }
  ${LINE_FRAGMENT}
`;

const CREATE_USER_LINE = gql`
  mutation CreateUserLine($userLineInput: UserLineInput!) {
    userLineCreate(userLineInput: $userLineInput) {
      ...UserLineFragment
    }
  }
  ${OPEN_LINE_FRAGMENT}
`;

const ACCEPT_USER_LINE = gql`
  mutation AcceptUserLine($userLineAcceptInput: UserLineAcceptInput!) {
    userLineAccept(userLineAcceptInput: $userLineAcceptInput) {
      ...UserLineFragment
    }
  }
  ${OPEN_LINE_FRAGMENT}
`;

export function useLines() {
  return useQuery<{ lines: Line[] }>(GET_LINES);
}

export function useCreateUserLine(line: Line) {
  return useMutation<
    {
      userLineCreate: UserLine;
    },
    {
      userLineInput: UserLineInput;
    }
  >(CREATE_USER_LINE, {
    errorPolicy: "all",
    update(cache, { data }) {
      cache.modify({
        id: cache.identify(line),
        fields: {
          openLines(existingOpenLineRefs = []) {
            const newOpenLine = data?.userLineCreate;
            if (newOpenLine) {
              const newOpenLineRef = cache.writeFragment({
                data: newOpenLine,
                fragment: OPEN_LINE_FRAGMENT,
              });
              return [...existingOpenLineRefs, newOpenLineRef];
            }
            return [...existingOpenLineRefs];
          },
        },
      });
    },
  });
}

export function useAcceptUserLine() {
  return useMutation<
    {
      userLineAccept: UserLine;
    },
    {
      userLineAcceptInput: UserLineAcceptInput;
    }
  >(ACCEPT_USER_LINE, {
    errorPolicy: "all",
    update(cache, { data }) {
      if (data?.userLineAccept) {
        cache.writeFragment({
          id: cache.identify(data?.userLineAccept),
          fragment: OPEN_LINE_FRAGMENT,
          data: data?.userLineAccept,
        });
      }
    },
  });
}
