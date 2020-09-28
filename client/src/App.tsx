import { Layout } from "antd";
import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "./App.css";
import UserLogin from "./auth/UserLogin";
import UserSignup from "./auth/UserSignup";
import Home from "./Home";

function App() {
  return (
    <Router>
      <Layout style={{ height: "100%" }}>
        <Layout.Content style={{ backgroundColor: "white" }}>
          <Switch>
            <Route exact path="/signup" component={UserSignup} />
            <Route exact path="/login" component={UserLogin} />
            <Route path="/" component={Home} />
          </Switch>
        </Layout.Content>
      </Layout>
    </Router>
  );
}

export default App;
