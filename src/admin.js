import React from "react";
import { graphqlOperation, API } from "aws-amplify";

// import API, { graphqlOperation } from "@aws-amplify/api";
import Auth from "@aws-amplify/auth";
import * as queries from "./graphql/queries";
import * as mutations from "./graphql/mutations";
import Amplify from "aws-amplify";
import { withAuthenticator } from "@aws-amplify/ui-react";
import awsconfig from "./aws-exports";
Amplify.configure(awsconfig);
Auth.configure(awsconfig);
API.configure(awsconfig);
class Admin extends React.Component {
  constructor(props) {
    super(props);

    this.state = {seek:0,

      movies: []
    };
  }

  async getmovies() {
    try {
      console.log(await Auth.currentAuthenticatedUser());
      let api = await API.graphql(
        graphqlOperation(queries.listWatchwithToonsMoviess, { limit: 10 })
      );
      console.log(api);
      this.setState({ movies: api.data.listWatchwithToonsMoviess.items });
    } catch (err) {
      console.log(err);
    }
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
            <button onClick={() => this.play(z.name)}>PLAY</button>
            {z.name}
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
