let ships = [];
let OPFORcnt = 2;

function updateOPFOR(a) {
  if (a == 1) {
    OPFORcnt += 1;
    ships.push(new OPFOR(random(width), random(height), crypto.randomUUID().slice(0,4)));
  }
  else {
    if (ships.length != 0 && OPFORcnt > 0) {
      OPFORcnt -= 1;
      ships.pop();
    }
  }
}

function setup() {
  createCanvas(windowWidth-5, windowHeight-5);

  buttonOPAdd = createButton('O+');
  buttonOPAdd.size(50);
  buttonOPAdd.position(10, 20);
  buttonOPAdd.mousePressed(() => { updateOPFOR(1) });

  ships.push(new BLUFOR(random(width), random(height), "I1"));

  for (let i = 0; i < OPFORcnt; i++) {
    ships.push(new OPFOR(random(width), random(height), crypto.randomUUID().slice(0,4)));
  }
}

function draw() {
  background(120);
  frameRate(124);

  for (let i = 0; i < ships.length; i++) {
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