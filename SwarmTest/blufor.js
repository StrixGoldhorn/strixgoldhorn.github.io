class BLUFOR extends Ship{
  constructor(x, y){
    super(x, y);
    this.maxspeed = 0.8;
    // this.maxspeed = 1.0;
    this.maxaccel = 0.1;
    this.maxforce = 0.1;
    this.hdglen = 60;
    this.color = color(51, 102, 255);
    this.mainSensorRange = 50;
    this.secondarySensorRange = 30;
    this.radarRange = 150;
    this.wpnRange = 20;
    this.wpnMult = 0.1;
    this.target = null;
    this.targetPath = [];
    this.extrapolateMult = 0.5;
    this.commRange = 200;
    this.targetViaComms = false;
    this.groupLead = false;
    this.target_ship_id = 0;
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
 
  seeRadar(){
    var x = this.displacement.x;
    var y = this.displacement.y;
    let hdg = this.velocity.heading();
    let sensorcolor = color(102, 255, 153, 16);
    strokeWeight(0);
    fill(sensorcolor);
    circle(x, y, this.radarRange * 2);
  }
 
  radarGuide(){   
    for (let i = 0; i < ships.length; i++) {
      let d = p5.Vector.dist(this.displacement, ships[i].displacement);
      let diff = p5.Vector.sub(this.displacement, ships[i].displacement);

      let hdgToShip = p5.Vector.sub(ships[i].displacement, this.displacement);

      if(
      (d > 0) && // check if self
      ((d < this.radarRange) || (this.target != null && this.targetViaComms == true)) && // check if within radar range or if target given via comms
      (ships[i].constructor.name == "OPFOR") && // check if is OPFOR
      ((this.target == null) || (this.target == ships[i].id) || (p5.Vector.dist(this.displacement, ships[this.target_ship_id].displacement) > d)) // track only if no target or if target is already tracked
      ){
        if((this.target == null) || (p5.Vector.dist(this.displacement, ships[this.target_ship_id].displacement) > d)){
          this.target = ships[i].id;
          this.target_ship_id = i
          this.targetPath = []
        }
        
        if(debug){
          let velVector = this.velocity.copy()
          velVector.normalize();
          velVector.mult(this.radarRange);
          stroke(0, 255, 0);
          line(velVector.x+this.displacement.x, velVector.y+this.displacement.y, this.displacement.x, this.displacement.y);

          fill("#9F6");
          circle(this.displacement.x, this.displacement.y, 10)
        }

        if(this.targetPath.length > 15){
          this.targetPath.shift();
        }
       
        let choose = random(-1, 1);
        if(choose > 0){
          this.targetPath.push(ships[i].displacement.copy());
        }
       
        let track = this.extrapolatePath(this.targetPath);
        super.steer(track);
      }
    }

  }
 
  extrapolatePath(pathArr){
    if(pathArr.length > 10){
      var curr = pathArr[pathArr.length - 1];
      var prev = pathArr[pathArr.length - 11];
     
      let predicted = p5.Vector.sub(curr, prev);
      let targetDisplacement = ships.find(o => o.id == this.target).displacement;
      let d = p5.Vector.dist(this.displacement, targetDisplacement);
     
      predicted.normalize();
      predicted.mult(this.extrapolateMult * d);
     
      let predictedDisplacement = p5.Vector.add(predicted, targetDisplacement);
     
      let extrapolatecolor = color(255, 0, 238, 255);
      fill(extrapolatecolor);
      circle(predicted.x + targetDisplacement.x, predicted.y + targetDisplacement.y, 8);
      return predictedDisplacement;
    }
   
    return ships.find(o => o.id == this.target).displacement;
  }
 
  seeComms(){
    var x = this.displacement.x;
    var y = this.displacement.y;
    let hdg = this.velocity.heading();
    let sensorcolor = color(0, 0, 0, 0);
    stroke(243, 79, 255, 255)
    strokeWeight(1);
    fill(sensorcolor);
    circle(x, y, this.commRange * 2);
  }
 
  checkComms(){    
//     only execute if not locked on target
    for(let i = 0; i < ships.length; i++){
      let d = p5.Vector.dist(this.displacement, ships[i].displacement);
      let diff = p5.Vector.sub(this.displacement, ships[i].displacement);

      if(
      (d > 0) && // check if self
      (d < this.commRange) && // check if within radar range
      (ships[i].constructor.name == "BLUFOR")// check if is BLUFOR
      ){
       
        if(ships[i].target != null && this.target == null){
          this.target = ships[i].target;
          this.targetViaComms = true;
          console.log(this.id, "TRACKING", ships[i].target, "(thru comms)");
        }
       
        stroke(224, 73, 235);
        line(ships[i].displacement.x, ships[i].displacement.y, this.displacement.x, this.displacement.y);
      }
    }
  }
 
  update(){
    super.update();
    this.render();
    super.seehdg();
    super.seeMainSensor();
    super.seeSecondarySensor();
    this.seeComms();
    this.checkComms();
    this.radarGuide();
    this.seeRadar();
    super.seeWpn();
  }
}