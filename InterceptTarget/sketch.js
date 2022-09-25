let ships = [];
let OPFORcnt = 2;
let mouseguide = true;

function updateOPFOR(a) {
  if (a == 1) {
    OPFORcnt += 1;
    ships.push(new OPFOR(random(width), random(height), crypto.randomUUID().slice(0, 4)));
  }
  else {
    if (ships.length != 0 && OPFORcnt > 0) {
      OPFORcnt -= 1;
      ships.pop();
    }
  }
}

function setup() {
  createCanvas(windowWidth - 5, windowHeight - 5);

  buttonOPAdd = createButton('+');
  buttonOPAdd.size(50);
  buttonOPAdd.position(10, 20);
  buttonOPAdd.mousePressed(() => { updateOPFOR(1) });

  buttonMGuide = createButton('Toggle Follow Cursor');
  buttonMGuide.size(150);
  buttonMGuide.position(70, 20);
  buttonMGuide.mousePressed(() => { mouseguide = !mouseguide });

  ships.push(new BLUFOR(random(width), random(height)));

  for (let i = 0; i < OPFORcnt; i++) {
    ships.push(new OPFOR(random(width), random(height), crypto.randomUUID().slice(0, 4)));
  }
}

function draw() {
  background(120);
  frameRate(124);
  noiseDetail(2, 0.2);

  for (let i = 0; i < ships.length; i++) {
    if (ships[i].constructor.name == "OPFOR" && mouseguide == false) {
      console.log(noise(ships[i].displacement.x), noise(ships[i].displacement.y));
      ships[i].acceleration.y += (noise(ships[i].displacement.y) - 0.3) * 0.005;
      ships[i].acceleration.x += (noise(ships[i].displacement.x) - 0.3) * 0.005;
    }
    ships[i].update();
  }
}

var paused = false;
document.body.onkeyup = function (e) {
  if (e.key == " " ||
    e.code == "Space" ||
    e.keyCode == 32
  ) {
    if (paused) {
      loop();
    }
    else {
      noLoop();
    }
    paused = !paused;
  }
}