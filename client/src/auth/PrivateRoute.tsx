import { useAuth } from ".";
import React from "react";
import { Redirect, Route } from "react-router-dom";

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
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? (
    <Route path={path} exact={exact} component={component} />
  ) : (
    <Redirect to="/login" />
  );
}
