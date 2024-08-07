// Set canvas size
const canvasWidth = window.innerWidth - 5;
const canvasHeight = window.innerHeight - 5;

// Missile properties
let missilePosition;
let missileSize;
let missileAngle;
let targetPosition;
let targetSize;
let previousMissilePosition;
let previousTargetPosition;

let soundPlaying = false;

const missileImageMult = 0.15;

// Movement variables
let targetVelocity;
const targetSpeed = 1;
let missileSpeed = 1;
let missilePaused = true;

// Preload function to load images
function preload() {
  missileImage = loadImage('missile.png');
  targetImage = loadImage('target.png');
}

// Keys object to track the state of keys
const keys = {};

// Arrow properties
let arrowPosition;
let arrowSize;
let arrowAngle;

// Setup function (runs once)
async function setup() {
  createCanvas(canvasWidth, canvasHeight);

  // Set initial missile position and target position
  missilePosition = createVector(0, 0);
  previousMissilePosition = createVector(0, 0);
  missileSize = createVector(20, 10);
  missileAngle = 0;
  targetPosition = createVector(canvasWidth / 2, canvasHeight / 2);
  previousTargetPosition = createVector(canvasWidth / 2, canvasHeight / 2);
  targetSize = 20;
  targetVelocity = createVector(0, 0);

  // Set initial arrow position and size
  arrowPosition = createVector(canvasWidth / 2, canvasHeight / 2);
  arrowSize = 20;
}

// Draw function (runs every frame)
async function draw() {
  // Set background color
  background(193, 211, 254);


  // Draw missile
  push();
  translate(missilePosition.x, missilePosition.y);
  rotate(missileAngle);
  imageMode(CENTER);
  image(missileImage, 0, 10, missileImage.width * missileImageMult, missileImage.height * missileImageMult);
  pop();

  targetAngle = atan2(targetPosition.y - previousTargetPosition.y, targetPosition.x - previousTargetPosition.x);
  // Draw target
  push();
  translate(targetPosition.x, targetPosition.y);
  rotate(targetAngle + Math.PI / 2);
  image(targetImage, -targetImage.width / 2, -targetImage.height / 2);

  pop();

  previousTargetPosition = targetPosition.copy();
  // Update missile's position and rotation based on the target
  if (!missilePaused) {
    const direction = p5.Vector.sub(targetPosition, missilePosition);
    missileAngle = direction.heading();
    direction.normalize();
    missilePosition.add(direction.mult(missileSpeed));
  }

  // Update target's position based on velocity
  targetPosition.add(targetVelocity.mult(targetSpeed));

  // Boundary check for missile position
  missilePosition.x = constrain(missilePosition.x, 0, canvasWidth);
  missilePosition.y = constrain(missilePosition.y, 0, canvasHeight);

  // Boundary check for target position
  targetPosition.x = constrain(targetPosition.x, 0, canvasWidth);
  targetPosition.y = constrain(targetPosition.y, 0, canvasHeight);

  // Calculate difference, or subtracted
  const subtracted = p5.Vector.sub(targetPosition, missilePosition);
  const deviation = subtracted.mag();

  // Play sound if none is playing
  if (!soundPlaying) {
    soundPlaying = true;
    switch (true) {
      case deviation < 200:
        await missileLaunchWarning();
        break;

      case 200 < deviation && deviation < 400:
        await radarLockWarning();
        break;

      default:
        break;
    }
    soundPlaying = false;
  }


  // Display text
  noStroke();
  fill(0);
  textSize(16);
  textAlign(LEFT);
  text(`Position where it wasn't: (${previousMissilePosition.x.toFixed(2)}, ${previousMissilePosition.y.toFixed(2)})`, 10, 20);
  text(`Position where it is: (${missilePosition.x.toFixed(2)}, ${missilePosition.y.toFixed(2)})`, 10, 40);
  text(`Position where it isn't: (${targetPosition.x.toFixed(2)}, ${targetPosition.y.toFixed(2)})`, 10, 60);
  text(`Deviation: (${subtracted.x.toFixed(2)}, ${subtracted.y.toFixed(2)})`, 10, 80);
  text(`Distance: ${deviation.toFixed(2)}`, 10, 100);

  previousMissilePosition = missilePosition.copy();
}

// Event function when arrow keys or WASD keys are pressed
async function keyPressed() {
  const stepSize = 1;

  // Update target velocity based on key press
  if (keyCode === UP_ARROW || key === "w") {
    keys.up = true;
    targetVelocity.y = -stepSize;
  } else if (keyCode === DOWN_ARROW || key === "s") {
    keys.down = true;
    targetVelocity.y = stepSize;
  } else if (keyCode === LEFT_ARROW || key === "a") {
    keys.left = true;
    targetVelocity.x = -stepSize;
  } else if (keyCode === RIGHT_ARROW || key === "d") {
    keys.right = true;
    targetVelocity.x = stepSize;
  }

  // Pause/resume missile movement on spacebar press
  if (keyCode === 32) {
    missilePaused = !missilePaused;
    document.getElementById("instr").style.visibility = "hidden";
  }

  // Adjust missile speed to match target speed
  missileSpeed = targetSpeed;
}

// Event function when arrow keys or WASD keys are released
async function keyReleased() {
  // Update target velocity based on key release
  if (keyCode === UP_ARROW || key === "w") {
    keys.up = false;
  } else if (keyCode === DOWN_ARROW || key === "s") {
    keys.down = false;
  } else if (keyCode === LEFT_ARROW || key === "a") {
    keys.left = false;
  } else if (keyCode === RIGHT_ARROW || key === "d") {
    keys.right = false;
  }

  // Update target velocity based on remaining pressed keys
  if (!keys.up && !keys.down) {
    targetVelocity.y = 0;
  }

  if (!keys.left && !keys.right) {
    targetVelocity.x = 0;
  }
}

// Call the setup function to initialize the canvas
setup();

function sleep(time) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('resolved');
    }, time);
  });
}

// Unused but left here so I can copy it for other projects
async function newContact() {
  generateSound("triangle", 430, 0.3, 0.05);
}

// Same as above
async function specialContact() {
  generateSound("triangle", 580, 0.12, 0.05);
  await sleep(90);
  generateSound("triangle", 550, 0.12, 0.05);
  await sleep(90);
  generateSound("triangle", 520, 0.12, 0.05);
  await sleep(90);
  generateSound("triangle", 490, 0.12, 0.05);
  await sleep(90);
}

async function radarLockWarning() {
  generateSound("triangle", 570, 0.25, 0.05);
  await sleep(250);
  generateSound("triangle", 380, 0.25, 0.05);
  await sleep(250);
}

async function missileLaunchWarning() {
  generateSound("triangle", 550, 0.1, 0.05);
  await sleep(105);
  generateSound("triangle", 400, 0.1, 0.05);
  await sleep(105);
}