class Ship {
  constructor(x, y, id) {
    this.id = id;
    this.displacement = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
  }

  steer(target) {
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

  checkKill(i) {
    if (ships[i].constructor.name != this.constructor.name) {
      console.log(ships[i].constructor.name, ships[i].id, "killed");
      OPFORcnt -= 1;
      if (ships[i].id == ships[0].target.id) {
        ships[0].target = null;
      }
      ships.splice(i, 1);
    }
  }

  seehdg() {
    var x = this.displacement.x;
    var y = this.displacement.y;
    let hdg = this.velocity.copy();
    hdg.normalize();
    hdg.mult(this.hdglen / 2);
    line(x, y, hdg.x + x, hdg.y + y);
  }

  update() {
    this.acceleration.limit(this.maxaccel);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxspeed);
    this.displacement.add(this.velocity);

    if ((this.displacement.x > width) ||
      (this.displacement.x < 0)) {
      this.velocity.x = -this.velocity.x;
      this.acceleration.x = -this.acceleration.x;
    }

    if ((this.displacement.y > height) ||
      (this.displacement.y < 0)) {
      this.velocity.y = -this.velocity.y;
      this.acceleration.y = -this.acceleration.y;
    }


    this.render();
  }
}