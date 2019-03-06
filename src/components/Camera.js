import './Camera.css';
import { ImageCapture } from 'image-capture';
import Compressor from 'compressorjs';
import axios from 'axios';
import React from 'react';

export default class Camera extends React.Component {
  state = {
    imageCapture: null,
    takeSnapshots: false,
    snapShots: []
  };

  constraints = {
    audio: false,
    video: {
      facingMode: {
        exact: 'environment'
      }
    }
  };

  setSnapshotInterval = () => {
    this.setState({ takeSnapshots: true });
    let data = JSON.stringify({
      scans: this.state.snapShots
    });

    if (this.state.snapShots.length > 0) {
      axios
        .post(`https://b918b3bb.ngrok.io/v3/licenses/decode`, data, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(res => {
          console.log('posted snapshots', res);
          this.setState({ snapShots: [] });
        })
        .catch(error => console.log('error posting snapshots', error));
    }
  };

  componentDidMount() {
    setInterval(this.setSnapshotInterval, 5000);

    navigator.mediaDevices
      .getUserMedia(this.constraints)
      .then(stream => {
        var video = document.getElementById('preview-player');
        video.srcObject = stream;
        video.play();

        const mediaStreamTrack = stream.getVideoTracks()[0];
        const imageCapture = new ImageCapture(mediaStreamTrack);

        if (imageCapture) {
          this.setState({ imageCapture: imageCapture });
        }
      })
      .then(deviceInfo => {
        var video = document.getElementById('preview-player');
        const imageCapture = this.state.imageCapture;

        video.ontimeupdate = () => {
          if (!this.state.takeSnapshots) {
            return;
          }

          imageCapture
            .takePhoto()
            .then(blob => {
              // the blob should be compressed before pushing into a queue
              var that = this;
              new Compressor(blob, {
                quality: 0.6,
                success(result) {
                  that.addSnapShot(result);
                },
                error(err) {
                  console.log(err.message);
                }
              });
            })
            .catch(error => console.log('takePhoto() error: ', error));
        };
      })
      .catch(error => console.log(error));
  }

  addSnapShot = blob => {
    var fileReader = new FileReader();
    fileReader.readAsDataURL(blob);
    fileReader.onloadend = () => {
      if (this.state.snapShots.length < 5) {
        let snaps = this.state.snapShots;
        snaps.push(fileReader.result);
        this.setState({ snapShots: snaps });
      }
    };
  };

  render() {
    return (
      <div>
        <div className="video-container">
          <video id="preview-player" playsInline />
          <p>{this.state.snapShots[0]}</p>
        </div>
      </div>
    );
  }
}
