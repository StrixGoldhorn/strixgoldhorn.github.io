let aircraft;
let runway;
let lorenzSignal;

let top1, btm1, top2, btm2, midtop, midbtm;

let ampDash, ampDot;

let mute = false;

let sound;
sound = new p5.Oscillator();

// Set initial properties for sound objects
sound.setType("sine");

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
}

async function draw() {
  background(220);

  // Display runway
  runway.display();

  // Display Lorenz signal 1
  fill(255, 0, 0, 50);
  top1 = height / 9;
  btm1 = height / 2 + height / 15;
  triangle(0, btm1, 0, top1, width, height / 2);

  // Display Lorenz signal 2
  fill(0, 0, 255, 50);
  top2 = height / 2 - height / 15;
  btm2 = 8 * (height / 9);
  triangle(0, btm2, 0, top2, width, height / 2);
  
  midtop = (btm1 - top1) / 2 + top1;
  midbtm = (btm2 - top2) / 2 + top2;

  [ampDot, ampDash] = normalizeRatio(
    shortestDistance(aircraft.x, aircraft.y, width, height / 2, 0, midtop),
    shortestDistance(aircraft.x, aircraft.y, width, height / 2, 0, midbtm)
  );

  // Update and display aircraft
  aircraft.update();
  aircraft.display();
}

function shortestDistance(x0, y0, x1, y1, x2, y2) {
  let numerator = abs((y2 - y1) * x0 - (x2 - x1) * y0 + x2 * y1 - y2 * x1);
  let denominator = sqrt(pow(y2 - y1, 2) + pow(x2 - x1, 2));
  return numerator / denominator;
}

function normalizeRatio(value1, value2) {
  if (value1 === 0 && value2 === 0) {
    return [0, 0];
  }

  const total = Math.abs(value1) + Math.abs(value2);
  const ratio1 = Math.abs(value1) / total;
  const ratio2 = Math.abs(value2) / total;

  return [Number((ratio1 / 8).toFixed(3)), Number((ratio2 / 8).toFixed(3))];
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

let dotP = true;

async function playSound() {
  if (!mute) {
    sound.start();
    while (true) {
      console.log(ampDot, ampDash);
      if (dotP) {
        sound.freq(440);
        sound.amp(ampDot, 0.1);
        await sleep(100);
      } else {
        sound.freq(440);
        sound.amp(ampDash, 0.1);
        await sleep(400);
      }
      dotP = !dotP;
    }
  }
}

function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("resolved");
    }, time);
  });
}

playSound();
