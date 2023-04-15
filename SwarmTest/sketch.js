let ships = [];
let BLUFORcnt = 3;
let OPFORcnt = 10;
let debug = false;

function updateBLUFOR(a){
  if(a == 1){
    BLUFORcnt += 1;
    ships.unshift(new BLUFOR(random(width), random(height)));
  }
  else{
    if(ships.length != 0 && BLUFORcnt > 0){
      BLUFORcnt -= 1;
      ships = ships.slice(1);
    }
  }
  console.log(BLUFORcnt, OPFORcnt, ships);
}

function updateOPFOR(a){
  if(a == 1){
    OPFORcnt += 1;
    ships.push(new OPFOR(random(width), random(height)));
  }
  else{
    if(ships.length != 0 && OPFORcnt > 0){
      OPFORcnt -= 1;
      ships.pop();
    }
  }
  console.log(BLUFORcnt, OPFORcnt, ships);
}

function setup() {
  createCanvas(windowWidth-10, windowHeight-10);
 
  checkboxDebug = createCheckbox('Debug', false);
  debug = true;
  checkboxDebug.position(10, 10);
  checkboxDebug.changed(()=>{debug = !debug;});
 
  buttonBLUAdd = createButton('B+');
  buttonBLUAdd.position(10, 30);
  buttonBLUAdd.mousePressed(()=>{updateBLUFOR(1)});
 
  buttonBLUSub = createButton('B-');
  buttonBLUSub.position(50, 30);
  buttonBLUSub.mousePressed(()=>{updateBLUFOR(-1)});
 
  buttonOPAdd = createButton('O+');
  buttonOPAdd.position(10, 60);
  buttonOPAdd.mousePressed(()=>{updateOPFOR(1)});
 
  buttonOPSub = createButton('O-');
  buttonOPSub.position(50, 60);
  buttonOPSub.mousePressed(()=>{updateOPFOR(-1)});
 
  for(let i = 0; i < BLUFORcnt; i++){
    ships.push(new BLUFOR(random(width), random(height)));
  }
  for(let i = 0; i < OPFORcnt; i++){
    ships.push(new OPFOR(random(width), random(height)));
  }
}

function draw() {
  background(120);
  frameRate(15);
 
  for(let i = 0; i < ships.length; i++){
//     perlin noise to randomly push ships
    ships[i].acceleration.x += (noise(ships[i].displacement.x + random(0,1)) - 0.5) * 0.1;
    ships[i].acceleration.y += (noise(ships[i].displacement.y + random(0,1)) - 0.5) * 0.1;
    ships[i].update();
  }
}