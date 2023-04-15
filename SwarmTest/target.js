class Target{
  constructor(id, velocity = null){
    this.id = id;
    this.velocity = velocity;
    this.displacementLog = [];
  }
  
  extrapolatePath(){
    let predicted;
    if(this.displacementLog.length >= 10){
    }
    else if (this.displacementLog.length >= 2){
      var curr = pathArr[pathArr.length - 1];
      var prev = pathArr[0];
     
      predicted = p5.Vector.sub(curr, prev);
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
    else{
      predicted = this.displacementLog[this.displacementLog.length - 1]
    }
      
    }
   
    return ships.find(o => o.id == this.target).displacement;
  }
}