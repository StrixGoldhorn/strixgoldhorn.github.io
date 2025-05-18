class BLUFOR extends Ship {
  constructor(x, y) {
    super(x, y,
      1.1, 0.05, 0.1,
      60, color(51, 102, 255),
      50, 30, 20, 0.1, 500);
    // x, y,
    // maxspeed, maxaccel, maxforce,
    // hdglen, color,
    // mainSensorRange, secondarySensorRange, wpnRange, wpnMult, commRange

    // Extra sensors
    this.radarRange = 250;

    // Target
    this.target = null;
    this.targetPath = [];
    this.extrapolateMult = 0.5;
    this.targetViaComms = false;

    // Grouping
    this.groupLead = false;
    this.groupID = null;
  }

  render() {
    super.render()
    if (debug) {
      // If currently chasing target, show target ID
      if (this.target != null) {
        strokeWeight(0);
        textSize(15);
        text("Tgt: " + this.target.id, this.displacement.x + 15, this.displacement.y + 20);
        strokeWeight(1);
      }

      // If currently in group, show group ID
      if (this.groupID != null) {
        strokeWeight(0);
        textSize(15);
        text("Grp: " + this.groupID, this.displacement.x + 15, this.displacement.y - 20);
        strokeWeight(1);
      }
    }
  }

  seeRadar() {
    var x = this.displacement.x;
    var y = this.displacement.y;
    let sensorcolor = color(102, 255, 153, 16);
    strokeWeight(0);
    fill(sensorcolor);
    circle(x, y, this.radarRange * 2);
  }

  radarGuide() {
    // Iterate through each ship in list
    for (let i = 0; i < ships.length; i++) {
      let d = p5.Vector.dist(this.displacement, ships[i].displacement);
      let diff = p5.Vector.sub(this.displacement, ships[i].displacement);

      let hdgToShip = p5.Vector.sub(ships[i].displacement, this.displacement);

      if (
        // Track ship if:
        // NOT self
        // within range
        // IS opfor

        (d > 0) && // cCheck if self
        ((d < this.radarRange) || (this.target != null && this.targetViaComms == true)) && // Check if within radar range or if target given via comms
        (ships[i].constructor.name == "OPFOR") // Check if is OPFOR
        // ((this.target == null) || (this.target == ships[i].id)) // Track only if no target or if target is the one already being tracked
      ) {

        // If ship had no target, set it to the current one
        if (this.target == null) {
          this.target = new Target(ships[i].id);
        }

        // Rlse if current is closer than the one being tracked, set current as new target
        else if (d < p5.Vector.dist(this.displacement, ships.find(o => o.id == this.target.id).displacement)) {
          this.target.id = ships[i].id;
          this.target.displacementLog = []
        }

        if (this.target.id == ships[i].id) {
          // Track current target path
          if (this.target.displacementLog.length > 15) {
            this.target.displacementLog.shift();
          }

          let choose = random(-1, 1);
          if (choose > 0) {
            this.target.displacementLog.push(ships[i].displacement.copy());
          }


          // If distance is furhter than mainSensorRange, use proportional navigation
          if(d > this.mainSensorRange){
            let track = this.target.extrapolatePath(this.displacement);
            super.steer(track);
          }
          // Else directly chase it
          else{
            super.steer(ships[i].displacement.copy())
            console.log(this.id, "direct chase", ships[i].id)
          }

        }

        if (debug) {
          let velVector = this.velocity.copy()
          velVector.normalize();
          velVector.mult(this.radarRange);
          stroke(0, 255, 0);
          line(velVector.x + this.displacement.x, velVector.y + this.displacement.y, this.displacement.x, this.displacement.y);

          // Show self
          fill("#9F6");
          circle(this.displacement.x, this.displacement.y, 10)

          // Target's displacement log
          this.target.drawDisplacementLog();
        }


      }
    }

  }

  extrapolatePath(pathArr) {
    if (pathArr.length > 10) {
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

  seeComms() {
    var x = this.displacement.x;
    var y = this.displacement.y;
    let hdg = this.velocity.heading();
    let sensorcolor = color(0, 0, 0, 0);
    stroke(243, 79, 255, 255)
    strokeWeight(1);
    fill(sensorcolor);
    circle(x, y, this.commRange * 2);
  }

  checkComms() {
    //     only execute if not locked on target
    for (let i = 0; i < ships.length; i++) {
      let d = p5.Vector.dist(this.displacement, ships[i].displacement);
      let diff = p5.Vector.sub(this.displacement, ships[i].displacement);

      if (
        (d > 0) && // check if self
        (d < this.commRange) && // check if within comm range
        (ships[i].constructor.name == "BLUFOR")// check if is BLUFOR
      ) {
        // check if in group already, else add to group
        if (this.groupID == null) {
          // if the other ship is also not in group, set self as group lead
          if (ships[i].groupID == null) {
            this.groupLead = true;
            this.groupID = "g" + this.id;
            ships[i].groupID = "g" + this.id;
          }
          else {
            this.groupID = ships[i].groupID;
          }
        }

        // if checked ship has target and ownself has no target, set other target as own target
        if (ships[i].target != null && this.target == null) {
          this.target = ships[i].target;
          this.targetViaComms = true;
          console.log(this.id, "TRACKING", ships[i].target, "(thru comms)");
        }

        stroke(224, 73, 235);
        line(ships[i].displacement.x, ships[i].displacement.y, this.displacement.x, this.displacement.y);
      }
    }
  }

  update() {
    super.update();
    this.render();
    this.seeComms();
    this.checkComms();
    if(userWaypoint === false){
      this.radarGuide();
    }
    else{
      super.steer(userWaypoint);
    }
    this.seeRadar();
  }
}