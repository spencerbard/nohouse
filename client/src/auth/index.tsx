import { gql, useMutation } from "@apollo/client";
import { Spin } from "antd";
import React from "react";
import { useHistory } from "react-router-dom";
import {
  CurrentUser,
  UserLoginInput,
  UserSignupInput,
} from "../generated/graphql";

const USER_LOGIN_TOKEN = gql`
  mutation UserLoginToken($token: String!) {
    userLoginToken(token: $token) {
      uid
      name
      email
      token
    }
  }
`;
const USER_LOGIN = gql`
  mutation LoginMutation($userLoginInput: UserLoginInput!) {
    userLogin(userLoginInput: $userLoginInput) {
      uid
      name
      email
      token
    }
  }
`;
const USER_SIGNUP_MUTATION = gql`
  mutation UserSignupMutation($userSignupInput: UserSignupInput!) {
    userSignup(userSignupInput: $userSignupInput) {
      uid
      name
      email
      token
    }
  }
`;

export enum AuthState {
  Authenticated = "Authenticated",
  Unauthenticated = "Unauthenticated",
  SigningUp = "SigningUp",
  LoggingIn = "LoggingIn",
  TokenLoggingIn = "TokenLoggingIn",
}

type TAuthContext = {
  error: Error | null;
  user: CurrentUser | null;
  isAuthenticated: boolean;
  state: AuthState;
  login(input: UserLoginInput): void;
  logout(): void;
  signup(input: UserSignupInput): void;
};

const AuthContext = React.createContext<TAuthContext>({
  error: null,
  user: null,
  isAuthenticated: false,
  state: AuthState.Unauthenticated,
  login: (_input: UserLoginInput) => {},
  logout: () => {},
  signup: (_input: UserSignupInput) => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const history = useHistory();
  const [error, setError] = React.useState<Error | null>(null);
  const [user, setUser] = React.useState<CurrentUser | null>(null);
  const [state, setState] = React.useState(AuthState.TokenLoggingIn);
  const isAuthenticated = state === AuthState.Authenticated;
  const token = localStorage.getItem("token");
  const [userLoginToken] = useMutation<
    { userLoginToken: CurrentUser },
    { token: string }
  >(USER_LOGIN_TOKEN, { errorPolicy: "all" });
  const [userLogin] = useMutation<
    {
      userLogin: CurrentUser;
    },
    {
      userLoginInput: UserLoginInput;
    }
  >(USER_LOGIN, { errorPolicy: "all" });
  const [userSignup] = useMutation<
    {
      userSignup: CurrentUser;
    },
    { userSignupInput: UserSignupInput }
  >(USER_SIGNUP_MUTATION, { errorPolicy: "all" });

  const handleLogin = React.useCallback(
    (user?: CurrentUser) => {
      if (user) {
        localStorage.setItem("token", user.token);
        setUser(user);
        setState(AuthState.Authenticated);
        setError(null);
        history.push("/");
      }
    },
    [setUser, setState, setError, history]
  );

  const logout = React.useCallback(() => {
    setState(AuthState.Unauthenticated);
    localStorage.removeItem("token");
    setUser(null);
  }, [setState, setUser]);

  const handleFailure = React.useCallback(
    (err: Error) => {
      setError(err);
      logout();
    },
    [setError, logout]
  );

  React.useEffect(() => {
    if (state === AuthState.TokenLoggingIn && token) {
      userLoginToken({ variables: { token } })
        .then((resp) => {
          handleLogin(resp?.data?.userLoginToken);
        })
        .catch((err) => {
          handleFailure(err.message);
        });
    } else if (state === AuthState.TokenLoggingIn) {
      setState(AuthState.Unauthenticated);
    }
  }, [state, handleFailure, handleLogin, token, userLoginToken]);

  if (state === AuthState.TokenLoggingIn) {
    return <Spin />;
  }

  async function login({ email, password }: UserLoginInput) {
    setState(AuthState.LoggingIn);
    const resp = await userLogin({
      variables: { userLoginInput: { email, password } },
    });
    if (resp.errors) {
      handleFailure(resp.errors[0]);
    }
    handleLogin(resp?.data?.userLogin);
  }

  async function signup(input: UserSignupInput) {
    setState(AuthState.SigningUp);
    const resp = await userSignup({
      variables: { userSignupInput: input },
    });
    if (resp.errors) {
      handleFailure(resp.errors[0]);
    }
    handleLogin(resp?.data?.userSignup);
  }

  return (
    <AuthContext.Provider
      value={{ error, user, state, isAuthenticated, login, logout, signup }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return React.useContext(AuthContext);
}
