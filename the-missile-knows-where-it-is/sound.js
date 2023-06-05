async function generateSound(type, freq, duration, duration2){
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    oscillator.type = type,
    oscillator.frequency.value = freq;
    const gainNode = context.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.start(0);
    gainNode.gain.value = gainNode.gain.defaultValue/8;
    gainNode.gain.linearRampToValueAtTime(gainNode.gain.value, context.currentTime + duration + duration2);
    gainNode.gain.linearRampToValueAtTime(0.0001, context.currentTime + duration + duration2 + duration2);
    oscillator.stop(context.currentTime + duration + duration2);

    // wait for sound to play finish before closing AudioContext, since Chrome won't start new AudioContext after 50 are created
    await sleep((duration + duration2 + duration2) * 1000);
    context.close()
}

function sleep(time) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve('resolved');
      }, time);
    });
  }