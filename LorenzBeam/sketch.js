let aircraft;
let runway;
let lorenzSignal;

let top1, btm1, top2, btm2;

let firstPlay = true;

let mute = false;

let dotPlaying = false;
let dashPlaying = false;

let dotSound;
let dashSound;
dotSound = new p5.Oscillator();
dashSound = new p5.Oscillator();

// Set initial properties for sound objects
dotSound.setType("sine");
dashSound.setType("sine");

function setup() {
  createCanvas(windowWidth, windowHeight);
  aircraft = new Aircraft();
  // Position the runway in the center-right of the screen
  runway = new Runway(
    width - windowWidth / 10,
    height / 2 - 25,
    windowWidth / 10,
    50
  );
  lorenzSignal = createVector(width / 2, height / 4);
}

async function draw() {
  background(220);

  // Display runway
  runway.display();

  // Display Lorenz signal 1
  fill(255, 0, 0, 50);
  top1 = height / 6;
  btm1 = height / 2 + height / 9;
  triangle(0, btm1, 0, top1, width, height / 2);
  line(0, (btm1 - top1) / 2 + top1, width, height / 2);

  // Display Lorenz signal 2
  fill(0, 0, 255, 50);
  top2 = height / 2 - height / 9;
  btm2 = 5 * (height / 6);
  triangle(0, btm2, 0, top2, width, height / 2);
  line(0, (btm2 - top2) / 2 + top2, width, height / 2);

  let midtop = (btm1 - top1) / 2 + top1;
  let midbtm = (btm2 - top2) / 2 + top2;

  // Update and display aircraft
  aircraft.update();
  aircraft.display();

  let offset = abs(aircraft.y - (height / 2));
  
  if (!mute) {
    if ((!dotPlaying || !dashPlaying) && checkInBeam1(aircraft.x, aircraft.y) && checkInBeam2(aircraft.x, aircraft.y)){
      
      dotPlaying = true;
      dashPlaying = true;
      await dotAndDash(0.2);
      dotPlaying = false;
      dashPlaying = false;
    }
    
    else if (!dotPlaying && checkInBeam1(aircraft.x, aircraft.y)) {
      dotPlaying = true;
      await dot(0.5-(1/(height/2) * offset));
      dotPlaying = false;
    }

    else if (!dashPlaying && checkInBeam2(aircraft.x, aircraft.y)) {
      dashPlaying = true;
      await dash(0.5-(1/(height/2) * offset));
      dashPlaying = false;
    }
  }
}
let keys = [];

function keyPressed() {
  // Add the pressed key to the array if it's not already there
  if (!keys.includes(key)) {
    keys.push(key);
  }

  handleKeys();
}

function keyReleased() {
  // Remove the released key from the array
  let index = keys.indexOf(key);
  if (index !== -1) {
    keys.splice(index, 1);
  }

  handleKeys();
}

function handleKeys() {
  // Handle continuous movement based on the keys pressed
  aircraft.setMovement(0, 0); // Reset movement

  if (keys.includes("A") || keys.includes("a")) {
    aircraft.addMovement(-1, 0);
  }
  if (keys.includes("D") || keys.includes("d")) {
    aircraft.addMovement(1, 0);
  }
  if (keys.includes("W") || keys.includes("w")) {
    aircraft.addMovement(0, -1);
  }
  if (keys.includes("S") || keys.includes("s")) {
    aircraft.addMovement(0, 1);
  }
}

class Aircraft {
  constructor() {
    this.x = 0;
    this.y = height / 2;
    this.radius = 10;
    this.xSpeed = 0;
    this.ySpeed = 0;
  }

  update() {
    // Update aircraft position based on speed
    this.x += this.xSpeed;
    this.y += this.ySpeed;

    if (this.x < 0) {
      this.x = 0;
    }

    if (this.x > width) {
      this.x = width;
    }

    if (this.y < 0) {
      this.y = 0;
    }

    if (this.y > height) {
      this.y = height;
    }
  }

  display() {
    fill(0, 0, 255);
    ellipse(this.x, this.y, this.radius * 2, this.radius * 2);
  }

  setMovement(xSpeed, ySpeed) {
    // Set the movement speed
    this.xSpeed = xSpeed;
    this.ySpeed = ySpeed;
  }

  addMovement(xSpeed, ySpeed) {
    // Set the movement speed
    this.xSpeed += xSpeed;
    this.ySpeed += ySpeed;
  }
}

class Runway {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
  }

  display() {
    fill(150);
    rect(this.x, this.y, this.width, this.height);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // Reposition the runway when the window is resized
  runway = new Runway(
    width - windowWidth / 10,
    height / 2 - 25,
    windowWidth / 10,
    50
  );
}

async function dot(amp) {
  dotSound.freq(440); // Adjust frequency as needed
  dotSound.amp(amp); // Adjust amplitude as needed
  dotSound.start();
  dotSound.stop(0.2);
  await sleep(600);
}

async function dash(amp) {
  dashSound.freq(440); // Adjust frequency as needed
  dashSound.amp(amp); // Adjust amplitude as needed
  dashSound.start();
  dashSound.stop(0.4);
  await sleep(600);
}

async function dotAndDash(amp) {
  dotSound.freq(440); // Adjust frequency as needed
  dotSound.amp(amp); // Adjust amplitude as needed
  dotSound.start();
  dotSound.stop(0.6);
  await sleep(600);
}

async function generateSound(type, freq, duration, duration2) {
  const context = new AudioContext();
  const oscillator = context.createOscillator();
  (oscillator.type = type), (oscillator.frequency.value = freq);
  const gainNode = context.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  oscillator.start(0);
  gainNode.gain.value = gainNode.gain.defaultValue / 8;
  gainNode.gain.linearRampToValueAtTime(
    gainNode.gain.value,
    context.currentTime + duration + duration2
  );
  gainNode.gain.linearRampToValueAtTime(
    0.0001,
    context.currentTime + duration + duration2 + duration2
  );
  oscillator.stop(context.currentTime + duration + duration2);

  // wait for sound to play finish before closing AudioContext, since Chrome won't start new AudioContext after 50 are created
  await sleep((duration + duration2 + duration2) * 1000);
  context.close();
}

function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("resolved");
    }, time);
  });
}

function area(x1, y1, x2, y2, x3, y3) {
  return Math.abs((x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)) / 2.0);
}

function isInside(x1, y1, x2, y2, x3, y3, x, y) {
  let A = area(x1, y1, x2, y2, x3, y3);
  let A1 = area(x, y, x2, y2, x3, y3);
  let A2 = area(x1, y1, x, y, x3, y3);
  let A3 = area(x1, y1, x2, y2, x, y);

  return abs(A - (A1 + A2 + A3)) < 0.1;
}

function checkInBeam1(x, y) {
  return isInside(0, top1, 0, btm1, width, height / 2, x, y);
}

function checkInBeam2(x, y) {
  return isInside(0, top2, 0, btm2, width, height / 2, x, y);
}
