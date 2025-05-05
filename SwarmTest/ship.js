class Ship{
  constructor(x, y, maxspeed, maxaccel, maxforce, hdglen, color, mainSensorRange, secondarySensorRange, wpnRange, wpnMult, commRange){
    this.id = crypto.randomUUID().slice(0,4);
    this.displacement = createVector(x,y);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);

    // Max limits
    this.maxspeed = maxspeed;
    this.maxaccel  = maxaccel;
    this.maxforce = maxforce;

    // Display stuff
    this.hdglen = hdglen
    this.color = color;

    // Sensor/Wpn/Comm ranges
    this.mainSensorRange = mainSensorRange;
    this.secondarySensorRange = secondarySensorRange;
    this.wpnRange = wpnRange;
    this.wpnMult = wpnMult;
    this.commRange = commRange;
  }
  
  steer(target){
    let steer = createVector(0, 0);
    let diff = p5.Vector.sub(this.displacement, target);
    diff.normalize();
    steer.sub(diff);
    steer.normalize();
    steer.mult(this.maxspeed);
    steer.sub(this.velocity);
    steer.limit(this.maxforce);
    this.acceleration.add(steer);
  }
 
  avoid(){
    let steer = createVector(0, 0);
    let count = 0;

    for (let i = 0; i < ships.length; i++) {
      let d = p5.Vector.dist(this.displacement, ships[i].displacement);
      let diff = p5.Vector.sub(this.displacement, ships[i].displacement);
      let hdgToShip = p5.Vector.sub(ships[i].displacement, this.displacement);

      if(
      (d > 0) && // check if self
      (((d < this.mainSensorRange) && (abs(hdgToShip.angleBetween(this.velocity)) < PI/4)) || // check if within main sensor range
      (d < this.secondarySensorRange) ) // check if within secondary sensor range
      ){       
        if(debug){
          let velVector = this.velocity.copy()
          velVector.normalize();
          velVector.mult(80);
          stroke(255, 255, 0);
          line(velVector.x+this.displacement.x, velVector.y+this.displacement.y, this.displacement.x, this.displacement.y);
         
          fill("#FF6");
          circle(this.displacement.x, this.displacement.y, 20)
        }
       
//         if this ship is blufor and checked ship is opfor, ignore
       if (!(this.constructor.name == "BLUFOR" && ships[i].constructor.name == "OPFOR")){
        diff.normalize();
        diff.div(d);
        steer.add(diff);
        count++;
       }
             
//         if within weapon range, roll for kill
        if(d <= this.wpnRange && this.constructor.name != ships[i].constructor.name){
          this.checkKill(i);
        }
      }
    }
    if (count > 0) {
      steer.div(count);
    }

    if (steer.mag() > 0) {
      steer.normalize();
      steer.mult(this.maxspeed);
      steer.sub(this.velocity);
      steer.limit(this.maxforce);
      this.acceleration.add(steer);
    }
  }
 
  checkKill(i){
    let r = random(-10 * this.wpnMult, 1);
    // let r = 1;
    if(r > 0){
      console.log(ships[i].constructor.name, ships[i].id, "killed");
      if(ships[i].constructor.name == "BLUFOR"){
        BLUFORcnt -= 1;
      }
      else{
        OPFORcnt -= 1;
//         reset targets of BLUFOR that was targeting OPFOR
        for(let j = 0; j < BLUFORcnt; j++){
          if(ships[j].target == ships[i].id){
            ships[j].target = null;
            ships[j].targetViaComms = false;
            ships[j].targetPath = [];
          }
        }
      }
      ships.splice(i, 1);
    }
  }
 
  seehdg(){
    var x = this.displacement.x;
    var y = this.displacement.y;
    let hdg = this.velocity.copy();
    hdg.normalize();
    hdg.mult(this.hdglen / 2);
    line(x, y, hdg.x+x, hdg.y+y);
  }
 
  seeWpn(){
    var x = this.displacement.x;
    var y = this.displacement.y;
    let hdg = this.velocity.heading();
    let sensorcolor = color(238, 170, 68, 64);
    strokeWeight(0);
    fill(sensorcolor);
    circle(x, y, this.wpnRange * 2);
  }
 


//   all sensors currently limited to Mk1 Eyball except radar on BLUFOR
  seeMainSensorFront(){
    var x = this.displacement.x;
    var y = this.displacement.y;
    let hdg = this.velocity.heading();
    let sensorcolor = color(this.color.levels);
    sensorcolor.setAlpha(32);
    fill(sensorcolor);
    arc(x, y, this.mainSensorRange * 2, this.mainSensorRange * 2, hdg - PI/4, hdg + PI/4);
  }
 
  seeMainSensorSide(){
    var x = this.displacement.x;
    var y = this.displacement.y;
    let hdg = this.velocity.heading();
    let sensorcolor = color(this.color.levels);
    sensorcolor.setAlpha(32);
    fill(sensorcolor);
    arc(x, y, this.secondarySensorRange * 2, this.secondarySensorRange * 2, hdg + PI/4, hdg - PI/4);
  }
 


  update(){
    this.avoid();
    this.acceleration.limit(this.maxaccel);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxspeed);
    this.displacement.add(this.velocity);
    
    // "reflect" off walls
    if((this.displacement.x > width) ||
      (this.displacement.x < 0)){
      this.velocity.x = -this.velocity.x;
      this.acceleration.x = -this.acceleration.x;
    }
    
    if((this.displacement.y > width) ||
      (this.displacement.y < 0)){
      this.velocity.y = -this.velocity.y;
      this.acceleration.y = -this.acceleration.y;
    }
      
   
    this.render();
    this.seehdg();
    this.seeMainSensorFront();
    this.seeMainSensorSide();
    this.seeWpn();
  }

  render() {
    strokeWeight(1);
    fill(this.color);
    stroke(200);
    circle(this.displacement.x, this.displacement.y, 8);
    if(debug){
      strokeWeight(0);
      fill(0,0,0);
      textSize(20);
      text(this.id, this.displacement.x + 5, this.displacement.y);
      strokeWeight(1);
      }
  }
}