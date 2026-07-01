// 音频引擎单例 - 管理 AudioContext + Analyser + Audio 元素
let audio = null;
let audioCtx = null;
let analyser = null;
let source = null;
let connected = false;
let freqBuffer = null;

export function getAudio() {
  if (!audio) {
    audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.preload = 'auto';
  }
  return audio;
}

export function initAudioSystem() {
  const a = getAudio();

  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return { audio: a, audioCtx: null, analyser: null };
    audioCtx = new AC();
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }

  if (!analyser) {
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512; // 256 bins
    analyser.smoothingTimeConstant = 0.82;
    analyser.minDecibels = -85;
    analyser.maxDecibels = -20;
  }

  if (!connected) {
    try {
      source = audioCtx.createMediaElementSource(a);
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
      connected = true;
    } catch (e) {
      // ignore
    }
  }

  return { audio: a, audioCtx, analyser };
}

export function getAnalyser() {
  return analyser;
}

export function getAudioContext() {
  return audioCtx;
}

// 对数频谱映射 - 让所有频段都有数据
export function readFrequencyDataLog(numBars = 64) {
  if (!analyser) return { data: new Float32Array(numBars), hasData: false };
  const bins = analyser.frequencyBinCount;
  if (!freqBuffer || freqBuffer.length !== bins) {
    freqBuffer = new Uint8Array(bins);
  }
  analyser.getByteFrequencyData(freqBuffer);

  const result = new Float32Array(numBars);
  const minFreq = 1;
  const maxFreq = bins;
  const logMin = Math.log(minFreq);
  const logMax = Math.log(maxFreq);

  let totalEnergy = 0;
  for (let i = 0; i < numBars; i++) {
    const ratio = i / numBars;
    const logFreq = logMin + ratio * (logMax - logMin);
    const binIdx = Math.floor(Math.exp(logFreq));
    const binIdx2 = Math.min(binIdx + 1, bins - 1);
    // 取两个 bin 的平均值
    const val = (freqBuffer[binIdx] + freqBuffer[binIdx2]) / 2;
    // 归一化并增强
    result[i] = Math.pow(val / 255, 0.7);
    totalEnergy += val;
  }

  const hasData = totalEnergy > numBars * 5;
  return { data: result, hasData };
}

export function readFrequencyData() {
  if (!analyser) return new Uint8Array(0);
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);
  return dataArray;
}
