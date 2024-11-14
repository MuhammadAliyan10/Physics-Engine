var canvas = document.getElementById("canvas"),
  cfx = canvas.getContext("2d"),
  height = 400,
  width = 400,
  stiffness = 0.5, // Spring stiffness constant
  b = -1, // Linear damping coefficient
  angularB = -7, // Angular damping coefficient
  dt = 0.02; // Time step for the simulation

// Vector object for position and physics calculations
var V = function (x, y) {
  this.x = x;
  this.y = y;
};
V.prototype.add = function (v) {
  return new V(this.x + v.x, this.y + v.y);
};
V.prototype.subtract = function (v) {
  return new V(this.x - v.x, this.y - v.y);
};
V.prototype.scale = function (s) {
  return new V(this.x * s, this.y * s);
};
V.prototype.dot = function (v) {
  return this.x * v.x + this.y * v.y;
};
V.prototype.cross = function (v) {
  return this.x * v.y - this.y * v.x;
};
V.prototype.rotate = function (angle, vector) {
  var x = this.x - vector.x;
  var y = this.y - vector.y;

  var xPrime = vector.x + (x * Math.cos(angle) - y * Math.sin(angle));
  var yPrime = vector.y + (x * Math.sin(angle) + y * Math.cos(angle));

  return new V(xPrime, yPrime);
};

// Rectangle object representing the moving object
var Rect = function (x, y, w, h, m) {
  this.m = m || 1; // Mass of the rectangle
  this.width = w;
  this.height = h;

  // Rectangle vertices
  this.topLeft = new V(x, y);
  this.topRight = new V(x + w, y);
  this.bottomLeft = new V(x, y + h);
  this.bottomRight = new V(x + w, y + h);

  this.v = new V(0, 0); // Velocity
  this.a = new V(0, 0); // Acceleration
  this.theta = 0; // Angle of rotation
  this.omega = 0; // Angular velocity
  this.alpha = 0; // Angular acceleration

  // Moment of inertia for a rectangle
  this.J =
    (this.m * (this.height * this.height + this.width * this.width)) / 12;
};
Rect.prototype.center = function () {
  var diagonal = this.bottomRight.subtract(this.topLeft);
  var midPoint = this.topLeft.add(diagonal.scale(0.5));
  return midPoint;
};
Rect.prototype.rotate = function (angle) {
  this.theta += angle;
  var center = this.center();
  this.topLeft = this.topLeft.rotate(angle, center);
  this.topRight = this.topRight.rotate(angle, center);
  this.bottomLeft = this.bottomLeft.rotate(angle, center);
  this.bottomRight = this.bottomRight.rotate(angle, center);
  return this;
};
Rect.prototype.move = function (v) {
  this.topLeft = this.topLeft.add(v);
  this.topRight = this.topRight.add(v);
  this.bottomLeft = this.bottomLeft.add(v);
  this.bottomRight = this.bottomRight.add(v);
  return this;
};

// Initialize the rectangle and spring
var rect = new Rect(200, 0, 100, 50);
rect.v = new V(0, 2); // Initial velocity
var spring = new V(200, 0); // Spring anchor position

// Main simulation loop
var loop = function () {
  var f = new V(0, 0); // Force
  var torque = 0; // Torque

  // Displacement and movement update
  var dr = rect.v.scale(dt).add(rect.a.scale(0.5 * dt * dt));
  rect.move(dr.scale(100)); // Move the rectangle based on displacement

  // Gravity force
  f = f.add(new V(0, rect.m * 9.81));

  // Damping force
  f = f.add(rect.v.scale(b));

  // Spring force
  var springForce = rect.topLeft.subtract(spring).scale(-1 * stiffness);
  f = f.add(springForce);

  // Calculate torque from the spring force
  var r = rect.center().subtract(rect.topLeft);
  torque += r.cross(springForce);

  // Calculate the new linear acceleration
  var new_a = f.scale(1 / rect.m); // F = ma, so a = F/m
  var dv = rect.a.add(new_a).scale(0.5 * dt);
  rect.v = rect.v.add(dv);

  // Angular damping and torque
  torque += rect.omega * angularB;
  rect.alpha = torque / rect.J; // Calculate angular acceleration
  rect.omega += rect.alpha * dt;
  var deltaTheta = rect.omega * dt;
  rect.rotate(deltaTheta); // Rotate based on angular velocity

  // Draw the rectangle and spring
  draw();
};

// Drawing function
var draw = function () {
  cfx.clearRect(0, 0, width, height);

  // Draw the rectangle
  cfx.save();
  cfx.translate(rect.center().x, rect.center().y);
  cfx.rotate(rect.theta);
  cfx.strokeStyle = "black";
  cfx.strokeRect(-rect.width / 2, -rect.height / 2, rect.width, rect.height);
  cfx.restore();

  // Draw the spring line
  cfx.strokeStyle = "#cccccc";
  cfx.beginPath();
  cfx.moveTo(spring.x, spring.y);
  cfx.lineTo(rect.topLeft.x, rect.topLeft.y);
  cfx.stroke();
  cfx.closePath();
};

// Run the simulation loop
setInterval(loop, dt * 1000);
