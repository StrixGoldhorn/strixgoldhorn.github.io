class BLUFOR extends Ship {
  constructor(x, y, id) {
    super(x, y, id);
    this.maxspeed = 0.5;
    this.maxaccel = 0.5;
    this.maxforce = 0.2;
    this.hdglen = 60;
    this.color = color(51, 102, 255, 80);
    this.wpnRange = 15;
    this.target = null;
  }

  render() {
    strokeWeight(1);
    fill(this.color);
    stroke(200);
    circle(this.displacement.x, this.displacement.y, 30);
  }

  radarGuide() {
    for (let i = 0; i < ships.length; i++) {
      let d = p5.Vector.dist(this.displacement, ships[i].displacement);

      if (
        (d > 0) && // check if self
        ((this.target == null) || (this.target.id == ships[i].id)) // track only if no target or if target is already tracked
      ) {
        if (this.target == null) {
          this.target = new Target(ships[i].id);
        }

        if (this.target.displacementLog.length > 29) {
          this.target.displacementLog.shift();
        }
        this.target.displacementLog.push(ships[i].displacement.copy());

        let predictedVector = this.target.extrapolatePath(this.displacement, p5.Vector.mag(this.velocity), this.predtarget);
        circle(predictedVector.x, predictedVector.y, 15);
        this.steer(predictedVector);
      }

      if (d <= this.wpnRange && this.constructor.name != ships[i].constructor.name) {
        this.checkKill(i);
      }
    }

  }

  update() {
    super.update();
    this.render();
    super.seehdg();
    this.radarGuide();
  }
}