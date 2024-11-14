var canvas = document.getElementById("canvas"),
  ctx = canvas.getContext("2d"),
  height = 400,
  width = 400,
  x = 200, //! x-axis
  y = 0, //! y-axis
  vy = 0, //! vertical-velocity
  ay = 0, //! acceleration
  m = 0.1, //! mass of the bass 0.1kg (affect on g)
  r = 10, //! Radius of the ball, 10px
  dt = 0.02, //! Time frame. Control the speed of the simulation
  e = -0.5, //! Coefficient of restitution, It simulate the elasticity of the ball bounce. On each bounce ball will lose 50% of its velocity
  rho = 1.2, //! Air density, 1.2 kg/m^3 . Used to calculate drag force
  cd = 0.47, //! Drag coefficient, Controls the strength of air resistance acting against the ball motion
  A = (Math.PI * r * r) / 10000; //* Cross sectional area of the ball, It represent the surface area expose to air resistance. divided by 10000 to match the scale to other units.

ctx.fillStyle = "red";

function loop() {
  var fy = 0; //! Total force applying on the ball. Vertically(y-axis)
  fy += m * 9.81; //* Gravity force on the ball (adjusted for Earth gravity). Newton second law F = ma
  fy += -0.5 * rho * cd * A * vy * vy * Math.sign(vy); //! Air resistance, adjusted to work in both directions. Rho(Air density), cd(Drag coefficient), A(Cross-Sectional-Area of the ball),

  // Update position and velocity
  let dy = vy * dt + 0.5 * ay * dt * dt; //* kinematic equation = ut + 0.5 * at ^ 2
  y += dy * 100; //! Multiply by 100 to scale up to canvas pixels

  let newAy = fy / m; //* Calculate new acceleration
  let avgAy = 0.5 * (newAy + ay); // !Use average acceleration
  vy += avgAy * dt; //* Update velocity

  //! Check for bounce
  if (y + r >= height) {
    //* Ball hits the ground
    if (Math.abs(vy) < 0.1) {
      //! If the velocity is very low, stop the ball
      vy = 0;
      y = height - r; //*() Ensure the ball stays on the ground
    } else {
      vy *= e; //! Apply bounce with coefficient of restitution
      y = height - r; //* Keep the ball at the ground level
    }
  }

  draw();
}

function draw() {
  ctx.clearRect(0, 0, width, height);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2, true);
  ctx.fill();
  ctx.closePath();
}
setInterval(loop, dt * 1000);
