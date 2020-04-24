import React from "react";
import {  API } from "aws-amplify";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Admin from "./admin";
import Client from "./client";
import Auth from "@aws-amplify/auth";
import Amplify from "@aws-amplify/core";

import awsconfig from "./aws-exports";
Amplify.configure(awsconfig);
Auth.configure(awsconfig);
API.configure(awsconfig);

class App extends React.Component {

  render() {
      return (
        <Router>
          <Route path="/" exact component={Client} />
          <Route path="/bossman" exact component={Admin} />
          </Router>
      );
  }
}

export default App;
