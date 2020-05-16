import React from "react";
import { graphqlOperation, API } from "aws-amplify";
import Auth from "@aws-amplify/auth";
import * as mutations from "./graphql/mutations";
import Amplify from "aws-amplify";
import { withAuthenticator } from "@aws-amplify/ui-react";
import awsconfig from "./aws-exports";
import Storage from "@aws-amplify/storage";
Amplify.configure(awsconfig);
Auth.configure(awsconfig);
API.configure(awsconfig);
class Admin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      seek: 0,
      movies: [],

      m:0,

      whatsplaying: "",
      time: 0,
      isOn: false,
      start: 0,
      dragalong:false,
      dragalongtime:60
    };
    this.startTimer = this.startTimer.bind(this);
    this.stopTimer = this.stopTimer.bind(this);
    this.resetTimer = this.resetTimer.bind(this);

  }
  async getmovies() {
    let s = await Storage.list("");
    this.setState({ movies: s.filter((z) => z.key !== "") });
  }
  startTimer() {
    this.setState({
      isOn: true,
      time: this.state.time,
      start: Date.now() - this.state.time,
    });
    this.timer = setInterval(() => {
      if ((this.state.time/1000).toFixed(0) % this.state.dragalongtime ===0 && this.state.dragalong) {
        console.log(this.state.time)
         API.graphql(
          graphqlOperation(mutations.createWatchwithToonsMessages, {
            input: {
              name: (this.state.time/1000).toFixed(0),
              command: "seek",
            },
          })
        );
      }
      this.setState({
        time: Date.now() - this.state.start,
      });
    }, 1000);
  }
  stopTimer() {
    this.setState({ isOn: false });
    clearInterval(this.timer);
  }
  resetTimer() {
    this.setState({ time: 0, isOn: false });
  }
  async doThing(input, thing) {
    if (thing === "play") {
      this.setState({ whatsplaying: input });
      this.startTimer();
    }
    if (thing === "start") {
      this.startTimer();
    }
    if (thing === "load") {
      this.setState({ whatsplaying: input });

      this.stopTimer();
      this.resetTimer();
    }
    if (thing === "stop") {
      this.setState({ whatsplaying: "" });
      this.stopTimer();
      this.resetTimer();
    }
    if (thing === "pause") {
      // this.setState({ whatsplaying: "" });
      this.stopTimer();
      // this.resetTimer();
    }
    if (thing === "unpause") {
      // this.setState({ whatsplaying: "" });
      this.startTimer();
      // this.resetTimer();
    }

    await API.graphql(
      graphqlOperation(mutations.createWatchwithToonsMessages, {
        input: {
          name: input,
          command: thing,
        },
      })
    );
  }
  componentDidMount() {
    this.getmovies();
  }

  render() {
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <button onClick={() => Auth.signOut()}>signout</button>
        <button onClick={() => this.getmovies()}>getmovies</button>
        {this.state.movies.map((z, idx) => (
          <div key={idx}>
            <button onClick={() => this.doThing(z.key, "play")}>PLAY</button>
            <button onClick={() => {this.doThing(z.key, "load")}}>LOAD</button>
            <button onClick={() => this.doThing(z.key, "start")}>START</button>
            {z.key}
          </div>
        ))}
        <button onClick={() => this.doThing("", "stop")}>stop</button>
        <button onClick={() => this.doThing("", "pause")}>pause</button>
        <button onClick={() => this.doThing("", "unpause")}>unpause</button>
        <button onClick={() => this.doThing("", "checkbuffer")}>check buffer</button>
        <button onClick={() => this.setState({dragalong:!this.state.dragalong})}>toggle drag along</button>
        <button onClick={() => this.setState({dragalongtime:this.state.dragalong+30})}>drag along +30</button>
        <button onClick={() => this.setState({dragalongtime:this.state.dragalong-30})}>drag along -30</button>
        <input
          value={this.state.seek}
          onChange={(change) =>
            this.setState({ seek: parseInt(change.target.value) })
          }
        ></input>
        <input

          value={this.state.seek/60}
          onChange={(change) =>
            this.setState({ seek: parseInt(change.target.value)*60 })
          }
        ></input>
        <button onClick={() => this.doThing(this.state.seek, "seek")}>
          seek
        </button>
        currently playing :{this.state.whatsplaying}
        <br />
        time:{(this.state.time / 1000).toFixed(0)}
        <br/>
        drag along: {this.state.dragalong?"true":"false"}
        <br/>
        drag along time: {this.state.dragalongtime}
      </div>
    );
  }
}

export default withAuthenticator(Admin);
