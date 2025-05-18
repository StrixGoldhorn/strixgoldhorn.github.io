class Target{
  constructor(id, velocity = null){
    this.id = id;
    this.extrapolateMult = 0.8;
    this.displacementLog = [];
  }

  extrapolatePath(vesselDisplacement){
    let predicted;

    // If enough data, extrapolate path
    if(this.displacementLog.length >= 1000){
    // TODO: Predict path
    }

    // Else just take path as current velocity
    else if (this.displacementLog.length >= 2){
      var curr = this.displacementLog[this.displacementLog.length - 1];
      var prev = this.displacementLog[this.displacementLog.length - 2];
     
      predicted = p5.Vector.sub(curr, prev);
      let targetDisplacement = ships.find(o => o.id == this.id).displacement;
      let d = p5.Vector.dist(vesselDisplacement, targetDisplacement);
     
      predicted.normalize();
      predicted.mult(this.extrapolateMult * d);
     
      let predictedDisplacement = p5.Vector.add(predicted, targetDisplacement);
     
      let extrapolatecolor = color(255, 0, 238, 255);
      fill(extrapolatecolor);
      noStroke();
      circle(predicted.x + targetDisplacement.x, predicted.y + targetDisplacement.y, 8);
      return predictedDisplacement;
    }

    // Else take as current point
    else{
      predicted = this.displacementLog[this.displacementLog.length - 1]
    }
   
    return ships.find(o => o.id == this.id).displacement;
  }

  drawDisplacementLog(){
    noFill();
    stroke(128, 0, 0);

    beginShape();
    this.displacementLog.forEach(element => {
      vertex(element.x, element.y);
    });
    endShape();
  }
}