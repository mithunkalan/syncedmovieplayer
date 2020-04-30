import React from "react";
import ReactPlayer from "react-player";
import { graphqlOperation, API } from "aws-amplify";

// import API, { graphqlOperation } from "@aws-amplify/api";
import Storage from "@aws-amplify/storage";
import Auth from "@aws-amplify/auth";
// import * as queries from "./graphql/queries";
import Amplify from "aws-amplify";
import awsconfig from "./aws-exports";
import * as subscriptions from "./graphql/subscriptions";
Amplify.configure(awsconfig);
Auth.configure(awsconfig);
API.configure(awsconfig);
// Storage.configure(awsconfig);
class Client extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      nomovies: true
    };
      this.ref = React.createRef();
  }
  async doplay(input) {
    if (input.value.data.onCreateWatchwithToonsMessages.command === "play") {
      let moviename = input.value.data.onCreateWatchwithToonsMessages.name;
      let file = await Storage.get(moviename, {
        expires: 9999999
      });
      this.setState({filer:file,nomovies:false})
    }
    if (input.value.data.onCreateWatchwithToonsMessages.command === "stop") {

      this.setState({filer:null,nomovies:true})
    }
    if (input.value.data.onCreateWatchwithToonsMessages.command === "seek") {

      this.ref.current.seekTo(input.value.data.onCreateWatchwithToonsMessages.name, "seconds");
    }
  }

async getlist(){

  // let s = await Storage.list('public/')
  // console.log(s)
}
  componentDidMount() {
     API.graphql(
      graphqlOperation(subscriptions.onCreateWatchwithToonsMessages)
    ).subscribe({
      next: todoData => this.doplay(todoData)
    });
      this.getlist()
  }

  render() {
    if (this.state.nomovies) {
      return (
        <div
          style={{
            backgroundColor: "#000",
            color: "#aaa",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          No Movies :(
        </div>
      );
    } else
      return (
        <div style={{ backgroundColor: "#000", color: "#666" }}>
          <ReactPlayer
            playing
            url={this.state.filer}
            ref={this.ref}
            controls
            width={"100%"}
            height={"100vh"}
            volume={0}
            muted
          />
        </div>
      );
  }
}

export default Client;
