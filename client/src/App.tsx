import styled from "@emotion/styled";
import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./auth";
import PrivateRoute from "./auth/PrivateRoute";
import UserLogin from "./auth/UserLogin";
import UserSignup from "./auth/UserSignup";
import Header from "./Header";
import Home from "./Home";

const Content = styled.div(() => ({
  width: "100%",
  height: "100%",
  padding: "64px 16px 16px 16px",
}));

function App() {
  return (
    <Router>
      <AuthProvider>
        <Header />
        <Content>
          <Switch>
            <Route exact path="/signup" component={UserSignup} />
            <Route exact path="/login" component={UserLogin} />
            <PrivateRoute exact={false} path="/" component={Home} />
          </Switch>
        </Content>
      </AuthProvider>
    </Router>
  );
}

export default App;
