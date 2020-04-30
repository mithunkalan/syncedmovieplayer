import React from "react";
import { graphqlOperation, API } from "aws-amplify";

// import API, { graphqlOperation } from "@aws-amplify/api";
import Auth from "@aws-amplify/auth";
// import * as queries from "./graphql/queries";
import * as mutations from "./graphql/mutations";
import Amplify from "aws-amplify";
import { withAuthenticator } from "@aws-amplify/ui-react";
import awsconfig from "./aws-exports";
import Storage from "@aws-amplify/storage";

Amplify.configure(awsconfig);
Auth.configure(awsconfig);
API.configure(awsconfig);
// Storage.configure(awsconfig);
class Admin extends React.Component {
  constructor(props) {
    super(props);

    this.state = {seek:0,

      movies: []
    };
  }

  async getmovies() {
    let s = await Storage.list('')
    this.setState({ movies: s.filter(z=>z.key!=="") });
  }
  
async stop() {
  await API.graphql(
    graphqlOperation(mutations.createWatchwithToonsMessages, {   input: {
        name: "asd",
        command: "stop"
      } })
  );
}

  async play(input) {
    await API.graphql(
      graphqlOperation(mutations.createWatchwithToonsMessages, {   input: {
          name: input,
          command: "play"
        } })
    );
  }
  async seek(input) {
    console.log(input)
    await API.graphql(
      graphqlOperation(mutations.createWatchwithToonsMessages, {   input: {
          name: input,
          command: "seek"
        } })
    );
  }
  render() {
    // console.log(this.state)
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <button onClick={() => Auth.signOut()}>signout</button>
        <button onClick={() => this.getmovies()}>getmovies</button>
        {this.state.movies.map((z, idx) => (
          <div key={idx}>
            <button onClick={() => this.play(z.key)}>PLAY</button>
            {z.key}
          </div>
        ))}
        <button onClick={() => this.stop()}>stop</button>
      <input value={this.state.seek} onChange={change=>this.setState({seek:parseInt(change.target.value)})} ></input>
      <button onClick={() => this.seek(this.state.seek)}>seek</button>
      </div>
    );
  }
}

export default withAuthenticator(Admin);
