import { gql, useMutation } from '@apollo/client';
import { Spin } from 'antd';
import React from 'react';
import { Redirect, Route } from 'react-router-dom';

const TOKEN_LOGIN_MUTATION = gql`
  mutation TokenLoginMutation($token: String!) {
    tokenLogin(token: $token) {
      uid
      name
      email
      token
    }
  }
`;

type PrivateRouteProps = {
  component: React.FC;
  path: string;
  exact: boolean;
};

export default function PrivateRoute({
  component,
  path,
  exact,
}: PrivateRouteProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [loginUser, { data: currentUser, loading }] = useMutation(
    TOKEN_LOGIN_MUTATION
  );
  React.useEffect(() => {
    const token = localStorage.get("token");
    if (token) {
      setIsLoading(true);
      loginUser(token);
    }
  }, []);
  React.useEffect(() => {
    setIsLoading(loading);
  }, [loading]);

  if (loading) {
    return <Spin />;
  }

  return currentUser ? (
    <Route
      currentUser={currentUser}
      path={path}
      exact={exact}
      component={component}
    />
  ) : (
    <Redirect to="/login" />
  );
}
