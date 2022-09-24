class OPFOR extends Ship{
  constructor(x, y, id){
    super(x, y, id);
    this.maxspeed = 0.3;
    this.maxaccel = 0.2;
    this.maxforce = 0.8;
    this.hdglen = 80;
    this.color = color(255, 17, 85, 80);
  }
 
  render() {
    strokeWeight(1);
    fill(this.color);
    stroke(200);
    circle(this.displacement.x, this.displacement.y, 30);
  }
 
  update(){
    super.steer(new p5.Vector(mouseX, mouseY));
    super.update();
    super.seehdg();
  }
}