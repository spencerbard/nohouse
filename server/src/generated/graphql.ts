export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** Handles Postgres NaN */
  CustomFloat: any;
};


export type Query = {
  __typename?: 'Query';
  lines?: Maybe<Array<Maybe<Line>>>;
  openLines?: Maybe<Array<Maybe<UserLine>>>;
};

export type Mutation = {
  __typename?: 'Mutation';
  userSignup?: Maybe<CurrentUser>;
  userLogin?: Maybe<CurrentUser>;
  userLoginToken?: Maybe<CurrentUser>;
  userLineCreate: UserLine;
  userLineAccept: UserLine;
};


export type MutationUserSignupArgs = {
  userSignupInput: UserSignupInput;
};


export type MutationUserLoginArgs = {
  userLoginInput: UserLoginInput;
};


export type MutationUserLoginTokenArgs = {
  token: Scalars['String'];
};


export type MutationUserLineCreateArgs = {
  userLineInput: UserLineInput;
};


export type MutationUserLineAcceptArgs = {
  userLineAcceptInput: UserLineAcceptInput;
};

export type UserLineAcceptInput = {
  user_line_uid: Scalars['String'];
  acceptor_side: LineMarketSide;
};

export enum LineMarketSide {
  SpreadHome = 'spread_home',
  SpreadAway = 'spread_away',
  TotalOver = 'total_over',
  TotalUnder = 'total_under',
  H2hHome = 'h2h_home',
  H2hAway = 'h2h_away'
}

export type UserLine = {
  __typename?: 'UserLine';
  uid: Scalars['String'];
  line_uid: Scalars['String'];
  amount: Scalars['Int'];
  creator_uid: Scalars['String'];
  created_at: Scalars['String'];
  creator_side: LineMarketSide;
  acceptor_uid?: Maybe<Scalars['String']>;
  accepted_at?: Maybe<Scalars['String']>;
  acceptor_side?: Maybe<LineMarketSide>;
  deleted_at?: Maybe<Scalars['String']>;
  line: Line;
  creator: User;
  acceptor?: Maybe<User>;
};

export type UserLineInput = {
  line_uid: Scalars['String'];
  amount: Scalars['Int'];
  creator_side: LineMarketSide;
};

export type Line = {
  __typename?: 'Line';
  uid: Scalars['String'];
  event_key: Scalars['String'];
  sport_key: Scalars['String'];
  home_team: Scalars['String'];
  away_team: Scalars['String'];
  event_start_time: Scalars['String'];
  h2h_home?: Maybe<Scalars['CustomFloat']>;
  h2h_away?: Maybe<Scalars['CustomFloat']>;
  h2h_draw?: Maybe<Scalars['CustomFloat']>;
  spread_home?: Maybe<Scalars['CustomFloat']>;
  spread_away?: Maybe<Scalars['CustomFloat']>;
  spread_home_vig?: Maybe<Scalars['CustomFloat']>;
  spread_away_vig?: Maybe<Scalars['CustomFloat']>;
  total?: Maybe<Scalars['CustomFloat']>;
  total_over_vig?: Maybe<Scalars['CustomFloat']>;
  total_under_vig?: Maybe<Scalars['CustomFloat']>;
  load_uid: Scalars['String'];
  created_at: Scalars['String'];
  openLines?: Maybe<Array<Maybe<UserLine>>>;
};

export type Sport = {
  __typename?: 'Sport';
  key: Scalars['String'];
  active: Scalars['Boolean'];
  group: Scalars['String'];
  details: Scalars['String'];
  title: Scalars['String'];
  has_outrights: Scalars['Boolean'];
  created_at: Scalars['String'];
};

export type User = {
  __typename?: 'User';
  uid: Scalars['String'];
  name: Scalars['String'];
  email: Scalars['String'];
};

export type CurrentUser = {
  __typename?: 'CurrentUser';
  uid: Scalars['String'];
  name: Scalars['String'];
  email: Scalars['String'];
  token: Scalars['String'];
};

export type UserSignupInput = {
  name: Scalars['String'];
  email: Scalars['String'];
  password: Scalars['String'];
};

export type UserLoginInput = {
  email: Scalars['String'];
  password: Scalars['String'];
};
