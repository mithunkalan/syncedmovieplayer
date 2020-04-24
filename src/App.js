import React from "react";
import ReactPlayer from "react-player";
import { graphqlOperation, API } from "aws-amplify";

// import API, { graphqlOperation } from "@aws-amplify/api";
import Storage from "@aws-amplify/storage";
import Auth from "@aws-amplify/auth";
import * as queries from "./graphql/queries";
import Amplify from "@aws-amplify/core";

import awsconfig from "./aws-exports";
Amplify.configure(awsconfig);
Auth.configure(awsconfig);
API.configure(awsconfig);

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      filer: "",
      ticker: new Date(Date.now()),
      timeto: " ",
      initialseekdone: false,
      movielist: [{ time: null, name: null }],
      nomovies: false
    };
    this.startTimer = this.startTimer.bind(this);
    this.stopTimer = this.stopTimer.bind(this);
    this.resetTimer = this.resetTimer.bind(this);
    this.ref = React.createRef();
  }

  async getList() {
    let api = await API.graphql(
      graphqlOperation(queries.listWatchwithToonsMoviess, { limit: 10 })
    );
    let movielist = api.data.listWatchwithToonsMoviess.items;
    movielist.forEach(z => {
      z.time = new Date(z.time);
      z.endtime = new Date(z.time);
      z.endtime = z.endtime.setMilliseconds(
        z.endtime.getMilliseconds() + parseInt(z.duration) * 1000
      );
      z.endtime = new Date(z.endtime);
    });

    movielist = movielist
      .sort((a, b) => a - b)
      .filter(z => z.endtime > new Date(Date.now()));
    // console.log(movielist[0].file)
    // console.log(await Storage.get(movielist[0].file))
    for (let i = 0; i < movielist.length; i++) {
      movielist[i].s3file = await Storage.get(movielist[i].name, {
        expires: 9999999
      });
    }

    // console.log(movielist);
    if (movielist.length > 0) {
      this.setState({ movielist });
      this.startTimer();
    } else {
      this.setState({ nomovies: true });
    }
  }
  componentDidMount() {
    this.getList();
  }
dosync(){
    let timenow = new Date(Date.now());
  let movies = this.state.movielist.filter(
    z => z.endtime > new Date(Date.now())
  );
  let timeto = movies[0].time;
  timeto = (timeto - timenow) / 1000;
    this.ref.current.seekTo(-timeto, "seconds");
}
  doAthing() {
    let timenow = new Date(Date.now());
    let movies = this.state.movielist.filter(
      z => z.endtime > new Date(Date.now())
    );
    if (movies.length === 0) {
      this.setState({ nomovies: true });
    } else {
      let timeto = movies[0].time;
      this.setState({
        filer: this.state.movielist.filter(
          z => z.endtime > new Date(Date.now())
        )[0].s3file
      });
      // console.log(timeto);
      timeto = (timeto - timenow) / 1000;
      // console.log(-timeto)
      // console.log(  this.ref.current.getCurrentTime())
      // console.log(this.ref.current.getCurrentTime() + timeto)
      this.setState({ ticker: timenow, timeto: timeto.toFixed(0) });
      if (timeto < 1 && !this.state.initialseekdone) {

        this.ref.current.seekTo(-timeto, "seconds");
        // console.log(timeto);
        this.setState({ initialseekdone: true });
      }
      if ((timeto < 1 )&& (this.ref.current.getCurrentTime() + timeto < -10)) {
        this.ref.current.seekTo(-timeto, "seconds");
      }
    }
  }

  startTimer() {
    this.setState({
      isOn: true,
      time: this.state.time,
      start: Date.now() - this.state.ticker
    });
    this.timer = setInterval(() => {
      this.doAthing();
    }, 1000);
  }

  stopTimer() {
    this.setState({ isOn: false });
    clearInterval(this.timer);
  }

  resetTimer() {
    this.setState({ time: 0, isOn: false });
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
          The movie is over
        </div>
      );
    } else if (this.state.timeto > 0)
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
          Movie will start in {this.state.timeto} seconds
          {this.state.timeto < 10 ? " Remember to unmute" : ""}
        </div>
      );
    else
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

export default App;
