import './Camera.css';
import { ImageCapture } from 'image-capture';
import React from 'react';

export default class Camera extends React.Component {
  state = { imageCapture: null, takeSnapshots: false };
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
  };

  componentDidMount() {
    setInterval(this.setSnapshotInterval, 50000);

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

          this.setState({ blobCount: this.state.blobCount - 1 });

          imageCapture
            .takePhoto()
            .then(blob => {
              // the blob should be compressed before pushing into a queue
              var fileReader = new FileReader();
              fileReader.readAsDataURL(blob);
              fileReader.onloadend = () => {
                console.log('#############');
                console.log(fileReader.result);
                console.log('#############');
              };
            })
            .catch(error => console.log('takePhoto() error: ', error));
        };
      })
      .catch(error => console.log(error));
  }

  render() {
    return (
      <div>
        <div className="video-container">
          <video id="preview-player" playsInline />
        </div>
      </div>
    );
  }
}
