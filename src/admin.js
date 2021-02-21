import React from "react";
import { graphqlOperation, API } from "aws-amplify";
import Auth from "@aws-amplify/auth";
import * as mutations from "./graphql/mutations";
import Amplify from "aws-amplify";
import Button from "@material-ui/core/Button";
import Snackbar from "@material-ui/core/Snackbar";
import ImageUploader from "react-images-upload";

import { withAuthenticator } from "@aws-amplify/ui-react";
import awsconfig from "./aws-exports";
import Storage from "@aws-amplify/storage";
Amplify.configure(awsconfig);
Auth.configure(awsconfig);
Storage.configure({
  bucket: "watchwithtoonss3",
  region: "af-south-1",
});
API.configure(awsconfig);
class Admin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      seek: 0,
      movies: [],
      m: 0,
      whatsplaying: "",
      time: 0,
      isOn: false,
      start: 0,
      dragalong: false,
      dragalongtime: 60,
    };
    this.startTimer = this.startTimer.bind(this);
    this.stopTimer = this.stopTimer.bind(this);
    this.resetTimer = this.resetTimer.bind(this);
    this.doSnackBar = this.doSnackBar.bind(this);
  }
  doSnackBar(input) {
    this.setState({ statusbar: true, statusbartext: input });
  }

  async getmovies() {
    try {
      let s = await Storage.list("");
      this.setState({ movies: s.filter((z) => z.key !== "") });
    } catch (err) {
      console.log(err);
    }
  }
  startTimer() {
    // console.log(this.state.time);
    this.setState({
      isOn: true,
      time: this.state.time,
      start: Date.now() - this.state.time,
    });
    this.timer = setInterval(() => {
      if (
        (this.state.time / 1000).toFixed(0) % this.state.dragalongtime === 0 &&
        this.state.dragalong &&
        this.state.isOn
      ) {
        API.graphql(
          graphqlOperation(mutations.createWatchwithToonsMessages, {
            input: {
              name: (this.state.time / 1000).toFixed(0),
              command: "seek",
            },
          })
        );
      }
      // console.log("HERE");
      if (this.state.isOn)
        this.setState({
          time: Date.now() - this.state.start,
        });
    }, 1000);

    this.timer = setInterval(() => {
      console.log(this.state.time);
      console.log(this.state.whatsplaying);

      if (this.state.isOn) {
        this.doThing(
          this.state.whatsplaying + "|" + this.state.seek,
          "catchup"
        );
      }
    }, 10000);
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
  async del(input) {
    console.log({ input });
    await Storage.remove(input);
    this.getmovies();
  }

  async upfile(e) {
    console.log({ e });
    const file = e;
    let self = this;
    try {
      await Storage.put(file.name, file, {
        progressCallback(progress) {
          self.doSnackBar(
            ((progress.loaded * 100) / progress.total).toFixed(2) + "%"
          );
          // console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
        },
      });
    } catch (err) {
      console.log("Error uploading file: ", err);
    }
  }

  render() {
    return (
      <div style={{ margin: 10 }}>
        <Snackbar
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          open={this.state.statusbar}
          autoHideDuration={3000}
          onClose={() => this.setState({ statusbar: false })}
          ContentProps={{
            "aria-describedby": "message-id",
          }}
          message={<span id="message-id">{this.state.statusbartext}</span>}
        />
        <ImageUploader
          key={Math.random()}
          buttonText="upload filim"
          onChange={(pictureFiles, pictureDataURLs) => {
            this.upfile(pictureFiles[0]);
            // console.log(pictureDataURLs[0]);
          }}
          imgExtension={[".mp4", ".gif"]}
          maxFileSize={102428800000}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() => Auth.signOut()}
        >
          signout
        </Button>
        <br />
        <Button
          variant="contained"
          color="primary"
          onClick={() => this.getmovies()}
        >
          getmovies
        </Button>
        <br />
        {this.state.movies.map((z, idx) => (
          <div key={idx}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => this.doThing(z.key, "play")}
            >
              PLAY
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                this.doThing(z.key, "load");
              }}
            >
              LOAD
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => this.doThing(z.key, "start")}
            >
              START
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => this.del(z.key)}
            >
              Delete
            </Button>
            {z.key}
          </div>
        ))}
        <Button
          variant="contained"
          color="primary"
          onClick={() => this.doThing("", "stop")}
        >
          stop playing
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            this.stopTimer();
            this.resetTimer();
          }}
        >
          reset timer
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            this.startTimer();
          }}
        >
          start timer
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => this.doThing("", "pause")}
        >
          pause
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => this.doThing("", "unpause")}
        >
          unpause
        </Button>
        <br />
        <Button
          variant="contained"
          color="primary"
          onClick={() => this.doThing("", "checkbuffer")}
        >
          check buffer
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => this.setState({ dragalong: !this.state.dragalong })}
        >
          toggle drag along
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() =>
            this.setState({ dragalongtime: this.state.dragalongtime + 30 })
          }
        >
          drag along +30
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() =>
            this.setState({ dragalongtime: this.state.dragalongtime - 30 })
          }
        >
          drag along -30
        </Button>
        <br />
        sec
        <input
          value={this.state.seek}
          onChange={(change) =>
            this.setState({ seek: parseInt(change.target.value) })
          }
        ></input>
        min
        <input
          value={this.state.seek / 60}
          onChange={(change) =>
            this.setState({ seek: parseInt(change.target.value) * 60 })
          }
        ></input>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            this.doThing(this.state.seek, "seek");
            this.setState({
              time: this.state.seek * 1000,
              start: Date.now() - this.state.seek * 1000,
            });
          }}
        >
          seek
        </Button>
        <br />
        currently playing :{this.state.whatsplaying}
        <br />
        time:{(this.state.time / 1000).toFixed(0)}
        <br />
        drag along: {this.state.dragalong ? "true" : "false"}
        <br />
        drag along time: {this.state.dragalongtime}
      </div>
    );
  }
}

export default withAuthenticator(Admin);
