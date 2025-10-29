// Global Animation Setting
window.requestAnimFrame =
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  function (callback) {
    window.setTimeout(callback, 1000 / 60);
  };

// Canvas
var canvas = document.getElementById("particle");
var ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ==================== HIPNOZ NOKTALARI ==================== //
function Particle(x, y, baseDistance) {
  this.angle = Math.random() * 2 * Math.PI;
  this.radius = Math.random() * 1.2 + 0.3;
  this.baseDistance = Math.random() * baseDistance + 20;
  this.distance = this.baseDistance;
  this.speed = 0.0005 + (this.baseDistance / baseDistance) * 0.015;

  this.exploding = false;
  this.velX = 0;
  this.velY = 0;
  this.opacity = 1;

  this.update = function (centerX, centerY) {
    if (!this.exploding) {
      this.angle += this.speed;
      this.x = centerX + this.distance * Math.cos(this.angle);
      this.y = centerY + this.distance * Math.sin(this.angle);
    } else {
      this.x += this.velX;
      this.y += this.velY;
      this.velX *= 0.95;
      this.velY *= 0.95;
      this.opacity *= 0.95;
    }
    this.draw();
  };

  this.explode = function () {
    this.exploding = true;
    let angle = Math.random() * Math.PI * 2;
    let force = Math.random() * 6 + 2;
    this.velX = Math.cos(angle) * force;
    this.velY = Math.sin(angle) * force;
  };

  this.draw = function () {
    ctx.fillStyle = `rgba(255,255,255,${this.opacity})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  };
}

function Emitter(x, y, particleCount) {
  this.position = { x: x, y: y };
  this.radius = 250;
  this.particles = [];
  this.count = particleCount;

  for (var i = 0; i < this.count; i++) {
    this.particles.push(
      new Particle(this.position.x, this.position.y, this.radius)
    );
  }
}

Emitter.prototype.update = function (time) {
  for (var i = 0; i < this.count; i++) {
    this.particles[i].update(this.position.x, this.position.y);
  }

  // Glow ekleme
  let gradient = ctx.createRadialGradient(
    this.position.x,
    this.position.y,
    this.radius / 2,
    this.position.x,
    this.position.y,
    this.radius
  );
  let r = Math.floor(150 + Math.sin(time * 0.01) * 105);
  let g = Math.floor(150 + Math.sin(time * 0.008 + 1) * 105);
  let b = Math.floor(200 + Math.sin(time * 0.005 + 2) * 55);
  gradient.addColorStop(0, `rgba(${r},${g},${b},0.15)`);
  gradient.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
  ctx.fill();
};

// ==================== KAR KRİSTAL TANESİ ==================== //
function Snowflake() {
  this.depth = Math.random() * 1.5 + 0.5;
  this.x = Math.random() * canvas.width;
  this.y = Math.random() * -canvas.height;
  this.size = (Math.random() * 3 + 1.5) * this.depth;
  this.speed = (Math.random() * 3 + 0.5) * this.depth;
  this.angle = Math.random() * Math.PI * 2;
  this.baseWind = (Math.random() - 0.5) * 1;
  this.windOffset = Math.random() * 1000;
  this.opacity = Math.random() * 0.5 + 0.5;
  this.twinkleSpeed = Math.random() * 0.05 + 0.02;
  this.colorShift = Math.random() * 0.3;
  this.rotation = Math.random() * Math.PI * 2;
  this.rotationSpeed = (Math.random() - 0.5) * 0.05;

  this.update = function (time) {
    let wind = this.baseWind + Math.sin(time * 0.002 + this.windOffset) * 0.5;
    this.y += this.speed;
    this.x += wind + Math.sin(this.angle) * 0.7;

    if (this.y > canvas.height) {
      this.y = Math.random() * -10;
      this.x = Math.random() * canvas.width;
      this.opacity = Math.random() * 0.5 + 0.5;
    }

    this.opacity += this.twinkleSpeed;
    if (this.opacity > 1 || this.opacity < 0.5) this.twinkleSpeed *= -1;

    this.rotation += this.rotationSpeed;
    this.draw();
  };

  this.draw = function () {
    let r = 255;
    let g = 255 - this.colorShift * 120;
    let b = 255 - this.colorShift * 60;
    ctx.strokeStyle = `rgba(${r},${g},${b},${this.opacity})`;
    ctx.shadowColor = `rgba(${r},${g},${b},${this.opacity})`;
    ctx.shadowBlur = 6;
    ctx.lineWidth = 1.5;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.depth, this.depth);
    ctx.rotate(this.rotation);

    for (let i = 0; i < 6; i++) {
      ctx.rotate((Math.PI * 2) / 6);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, this.size);
      ctx.stroke();
    }

    ctx.restore();
  };
}

// ==================== ANİMASYON ==================== //
var emitter = new Emitter(canvas.width / 2, canvas.height / 2, 2000);
var snowflakes = [];
var showHypno = true;
var showSnow = false;

setTimeout(() => {
  emitter.particles.forEach((p) => p.explode());
  showSnow = true;
  for (let i = 0; i < 400; i++) {
    snowflakes.push(new Snowflake());
  }

  setTimeout(() => {
    showHypno = false;
  }, 1500);
}, 4000);

var time = 0;
function loop() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Hafif sis efekti
  ctx.fillStyle = "rgba(255,255,255,0.02)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (showHypno) {
    emitter.update(time);
  }

  if (showSnow) {
    for (let i = 0; i < snowflakes.length; i++) {
      snowflakes[i].update(time);
    }
  }

  time++;
  requestAnimFrame(loop);
}

loop();

window.addEventListener("resize", function () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
