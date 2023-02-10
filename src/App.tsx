import { useEffect, useRef } from 'react';
import './App.css';
// @ts-ignore
import Wave from 'wave-visualizer';
import RecordRTC from 'recordrtc';

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const recorder = useRef<RecordRTC>();

  useEffect(() => {
    const setupEruda = () => {
      const script = document.createElement('script');
      script.src = '//cdn.jsdelivr.net/npm/eruda';
      document.body.appendChild(script);
      script.onload = function () {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        eruda.init();
      };
    };

    const createMediaStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });

        // Setup video
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Setup audio waveform
        const wave = new Wave();
        wave.fromStream(stream, 'output', {
          colors: ['red', 'white', 'blue'],
        });

        console.log('[APP]', 'created media stream');

        recorder.current = new RecordRTC(stream, {
          type: 'video',
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          mimeType: 'video/webm;codecs=vp9,pcm', // endpoint requires 16bit PCM audio
          timeSlice: 500,
          ondataavailable: (blob) => {
            console.log('[APP]', 'receiving blob', blob.size);
          },
          disableLogs: false,
        });
      } catch (error) {
        console.error(error);
      }
    };

    const listMediaDevices = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      console.log('[APP]', 'list devices', devices);
    };

    // DEV
    setupEruda();

    createMediaStream();
    listMediaDevices();
  }, []);

  return (
    <div className="App">
      <h1>Waveform</h1>
      <video
        ref={videoRef}
        height="250"
        width="250"
        autoPlay
        loop
        playsInline
        muted={true}
      />
      <canvas id="output" height="150" width="250" />

      <button
        onClick={() => {
          recorder.current?.startRecording();
        }}
      >
        Start recording
      </button>
      <button
        onClick={() => {
          recorder.current?.stopRecording();
        }}
      >
        Stop recording
      </button>
    </div>
  );
}

export default App;
