class OPFOR extends Ship{
  constructor(x, y){
    super(x, y);
    this.maxspeed = 0.8;
    // this.maxspeed = 0.4;
    this.maxaccel = 0.2;
    this.maxforce = 0.4;
    this.hdglen = 80;
    this.color = color(255, 17, 85);
    this.mainSensorRange = 30;
    this.secondarySensorRange = 19;
    this.wpnRange = 15;
    this.wpnMult = 1;
    this.commRange = 300;
  }
 
  render() {
    strokeWeight(1);
    fill(this.color);
    stroke(200);
    circle(this.displacement.x, this.displacement.y, 8);
  }
 
  update(){
    super.update();
    super.seehdg();
    super.seeMainSensor();
    super.seeSecondarySensor();
    super.seeWpn();
  }
}