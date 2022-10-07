import { createSignal } from 'solid-js';

const [rawData, setRawData] = createSignal<number[]>([]);
export const startFromFile = async () => {
  const res = await fetch('./spectrum.mp3');
  const byteArray = await res.arrayBuffer();

  const context = new AudioContext();
  const audioBuffer = await context.decodeAudioData(byteArray);
  const source = context.createBufferSource();
  source.buffer = audioBuffer;

  const analyser = context.createAnalyser();
  analyser.fftSize = 512;

  source.connect(analyser);
  analyser.connect(context.destination);
  source.start();

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  const udpate = () => {
    analyser.getByteFrequencyData(dataArray);
    const originalData = Array.from(dataArray);
    setRawData([...[...originalData].reverse(), ...originalData]);
    requestAnimationFrame(udpate);
  };

  requestAnimationFrame(udpate);
};

export { rawData };
