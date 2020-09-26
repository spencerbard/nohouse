export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Query = {
  __typename?: 'Query';
  odds?: Maybe<Scalars['String']>;
  sports?: Maybe<Array<Maybe<Sport>>>;
};

export type Mutation = {
  __typename?: 'Mutation';
  userSignup?: Maybe<CurrentUser>;
  userLogin?: Maybe<CurrentUser>;
  userLoginToken?: Maybe<CurrentUser>;
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
