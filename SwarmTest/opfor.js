class OPFOR extends Ship{
  constructor(x, y){
    super(x, y,
      0.8, 0.2, 0.4,
      80, color(255, 17, 85),
      30, 19, 15, 1, 300);
    // x, y,
    // maxspeed, maxaccel, maxforce,
    // hdglen, color,
    // mainSensorRange, secondarySensorRange, wpnRange, wpnMult, commRange
  }
}