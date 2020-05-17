import React from "react";
import ReactPlayer from "react-player";
import { graphqlOperation, API } from "aws-amplify";
import Storage from "@aws-amplify/storage";
import Auth from "@aws-amplify/auth";
import Amplify from "aws-amplify";
import awsconfig from "./aws-exports";
import * as subscriptions from "./graphql/subscriptions";
Amplify.configure(awsconfig);
Auth.configure(awsconfig);
API.configure(awsconfig);
Storage.configure({
  bucket:'watchwithtoonss3',
  region:'af-south-1'
});
class Client extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      nomovies: true,
      playing: true,
    };
    this.ref = React.createRef();
  }
  async doplay(input) {
    if (input.value.data.onCreateWatchwithToonsMessages.command === "play") {
      let moviename = input.value.data.onCreateWatchwithToonsMessages.name;
      let file = await Storage.get(moviename, {
        expires: 9999999,
      });
      this.setState({ filer: file, nomovies: false, playing: true });
    }
    if (input.value.data.onCreateWatchwithToonsMessages.command === "load") {
      let moviename = input.value.data.onCreateWatchwithToonsMessages.name;
      let file = await Storage.get(moviename, {
        expires: 9999999,
      });
      this.setState({ filer: file, nomovies: false, playing: false });
    }
    if (input.value.data.onCreateWatchwithToonsMessages.command === "stop") {
      this.setState({ filer: null, nomovies: true });
    }
    if (input.value.data.onCreateWatchwithToonsMessages.command === "start") {
      this.setState({ playing: true });
    }
    if (input.value.data.onCreateWatchwithToonsMessages.command === "seek") {
      this.ref.current.seekTo(
        input.value.data.onCreateWatchwithToonsMessages.name,
        "seconds"
      );
    }
    if (input.value.data.onCreateWatchwithToonsMessages.command === "pause") {
      this.setState({ playing: false });
    }
    if (input.value.data.onCreateWatchwithToonsMessages.command === "checkbuffer") {
      console.log(this.ref)
      console.log(this.ref.current.getSecondsLoaded())
    }
    if (input.value.data.onCreateWatchwithToonsMessages.command === "unpause") {
      this.setState({ playing: true});
    }
  }

  componentDidMount() {
    API.graphql(
      graphqlOperation(subscriptions.onCreateWatchwithToonsMessages)
    ).subscribe({
      next: (todoData) => this.doplay(todoData),
    });
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
            justifyContent: "center",
          }}
        >
          No Movies :(
        </div>
      );
    } else
      return (
        <div style={{ backgroundColor: "#000", color: "#666" }}>
          <ReactPlayer
            playing={this.state.playing}
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
