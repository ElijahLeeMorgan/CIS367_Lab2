// Start AI code
let audioCtx, analyser, source, isPlaying = false;
let floatFrequencyData, byteFrequencyData, byteTimeDomainData, floatTimeDomainData;
let audioBuffer; // Store the decoded audio buffer for reuse

// Initialize audio context and analyzer
function initAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    
    // Create data arrays
    const bufferLength = analyser.frequencyBinCount;
    floatFrequencyData = new Float32Array(bufferLength);
    byteFrequencyData = new Uint8Array(bufferLength);
    byteTimeDomainData = new Uint8Array(bufferLength);
    floatTimeDomainData = new Float32Array(analyser.fftSize);
}

// File input handler
document.getElementById('audioFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const arrayBuffer = await file.arrayBuffer();
    audioBuffer = await audioCtx.decodeAudioData(arrayBuffer); // Store the buffer
    setupSource(); // Set up the source
});

// Set up audio source
function setupSource() {
    if (source) source.disconnect(); // Clean up the previous source if it exists
    source = audioCtx.createBufferSource(); // Create a new source
    source.buffer = audioBuffer; // Assign the stored buffer
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    
    document.getElementById('playButton').disabled = false;
    document.getElementById('pauseButton').disabled = false;
}

// Analysis functions
function analyzeAudio() {
    if (!isPlaying) return;

    // Capture all data types
    analyser.getFloatFrequencyData(floatFrequencyData);
    analyser.getByteFrequencyData(byteFrequencyData);
    analyser.getByteTimeDomainData(byteTimeDomainData);
    analyser.getFloatTimeDomainData(floatTimeDomainData);

    // Calculate metrics
    updateVolumeMetrics();
    updateFrequencyBands();
    updateWaveformMetrics();

    requestAnimationFrame(analyzeAudio);
}

function updateVolumeMetrics() {
    // Calculate RMS volume from float time domain data
    let sum = 0;
    for (let i = 0; i < floatTimeDomainData.length; i++) {
        sum += floatTimeDomainData[i] ** 2;
    }
    const rms = Math.sqrt(sum / floatTimeDomainData.length);
    document.getElementById('rmsVolume').textContent = rms.toFixed(4);
}

function updateFrequencyBands() {
    // Convert frequency data to bass/mid/treble levels
    const nyquist = audioCtx.sampleRate / 2;
    const bassEnd = Math.floor(250 / (nyquist / floatFrequencyData.length));
    const midEnd = Math.floor(4000 / (nyquist / floatFrequencyData.length));

    let bassSum = 0, midSum = 0, trebleSum = 0;
    
    for (let i = 0; i < floatFrequencyData.length; i++) {
        const amplitudeDB = floatFrequencyData[i];
        const amplitude = 10 ** (amplitudeDB / 20); // Convert dB to linear scale

        if (i <= bassEnd) bassSum += amplitude;
        else if (i <= midEnd) midSum += amplitude;
        else trebleSum += amplitude;
    }

    document.getElementById('bass').textContent = bassSum.toFixed(4);
    document.getElementById('mid').textContent = midSum.toFixed(4);
    document.getElementById('treble').textContent = trebleSum.toFixed(4);
}

function updateWaveformMetrics() {
    // Calculate waveform characteristics
    let min = 1, max = -1, sum = 0;
    for (const value of floatTimeDomainData) {
        min = Math.min(min, value);
        max = Math.max(max, value);
        sum += value;
    }
    const avg = sum / floatTimeDomainData.length;

    // Smooth out the average using a simple moving average
    const smoothingFactor = 0.9;
    if (!updateWaveformMetrics.previousAvg) {
        updateWaveformMetrics.previousAvg = avg;
    } else {
        updateWaveformMetrics.previousAvg = 
            smoothingFactor * updateWaveformMetrics.previousAvg + (1 - smoothingFactor) * avg;
    }

    document.getElementById('waveform').textContent = 
        `${min.toFixed(2)} / ${max.toFixed(2)} (Avg: ${updateWaveformMetrics.previousAvg.toFixed(2)})`;
}

// Control handlers
document.getElementById('playButton').addEventListener('click', () => {
    if (!audioBuffer) return; // Ensure audio is loaded
    if (isPlaying) return; // Prevent multiple plays

    isPlaying = true;
    setupSource(); // Recreate the source
    source.start(0); // Start playback
    analyzeAudio(); // Begin analysis
});

document.getElementById('pauseButton').addEventListener('click', () => {
    if (!source) return;
    isPlaying = false;
    source.stop(); // Stop playback
    source.disconnect(); // Clean up the source
});

// Initialize
initAudio();
// End AI Code