class Target {
  constructor(id) {
    this.id = id;
    this.displacementLog = [];
  }

  extrapolatePath(chasePos, chaseSpeed) {

    if (this.displacementLog.length >= 2) {
      let curr = this.displacementLog[this.displacementLog.length - 1];
      let prev = this.displacementLog[this.displacementLog.length - 2];

      let d = chasePos.dist(curr);

      let Va = p5.Vector.sub(curr, prev);
      let Sa = p5.Vector.mag(Va);
      let Sb = chaseSpeed;
      let D = p5.Vector.sub(chasePos, curr);

      // at^2 + bt + c = 0
      let a = Sb - Sa;
      let b = 2 * p5.Vector.dot(D, Va);
      let c = - (d ** 2);

      let t1 = (-b + Math.sqrt(b ** 2 - 4 * a * c)) / (2 * a);
      let t2 = (-b - Math.sqrt(b ** 2 - 4 * a * c)) / (2 * a);

      let VaNormalised = new p5.Vector.normalize(Va);

      let I1 = p5.Vector.add(curr, p5.Vector.mult(VaNormalised, t1 * Sa));
      let I2 = p5.Vector.add(curr, p5.Vector.mult(VaNormalised, - (t2 * Sa)));

      fill(color(255, 51, 51, 255));

      if (p5.Vector.dist(curr, I1) > p5.Vector.dist(curr, I2)) {
        line(curr.x, curr.y, I1.x, I1.y);
        line(chasePos.x, chasePos.y, I2.x, I2.y);
        circle(I1.x, I1.y, 10);
        circle(I2.x, I2.y, 15);
        return I2;
      }
      else {
        line(curr.x, curr.y, I2.x, I2.y);
        line(chasePos.x, chasePos.y, I1.x, I1.y);
        circle(I1.x, I1.y, 15);
        circle(I2.x, I2.y, 10);
        return I1;
      }

    }

    else {
      let predicted = this.displacementLog[this.displacementLog.length - 1]
      return predicted;
    }
  }


}