let g = 10;

let phase = "ready";
let paused = false;

let u = 20;
let E = 20;
let frac = 0.5;

let t = 0;
let tMax = 0;

let left = null;
let right = null;

let trailLayer;
let scale;

// =========================

function getCanvasHeight() {
  return window.innerHeight * 0.5;
}

// ✅ ΕΔΩ ΤΟ ΚΛΕΙΔΙ ΓΙΑ ΤΟ Χ
function computeScale() {

  let h = u * u / (2 * g);
  let tFall = u / g;

  let mR = frac;
  let mL = 1 - frac;

  let vR = Math.sqrt((2 * E) / (mR + (mR * mR) / mL));
  let vL = Math.abs((mR / mL) * vR);

  let Smax = Math.max(vR, vL) * tFall;

  let scaleX = width * 0.65 / Smax;     // 👈 γεμίζει περισσότερο πλάτος
let scaleY = height * 0.80 / h;       // 👈 ανεβαίνει πιο ψηλά

scale = Math.min(scaleY, scaleX);

}

function toX(x) {
  return width / 2 + x * scale;
}

function toY(y) {
  return height - 20 - y * scale;
}

// =========================

function setup() {
  let c = createCanvas(window.innerWidth * 0.9, getCanvasHeight());
  c.parent("sketch-holder");

  trailLayer = createGraphics(width, height);

  resetSim();
}

function windowResized() {
  resizeCanvas(window.innerWidth * 0.9, getCanvasHeight());
  trailLayer = createGraphics(width, height);
  computeScale();
}

// =========================

function resetSim() {

  t = 0;
  tMax = u / g;

  left = null;
  right = null;

  phase = "ready";

  trailLayer.clear();
  computeScale();

  paused = false;
  document.getElementById("pauseBtn").innerText = "Stop";
}

// =========================

function draw() {

  if (paused) return;

  background(220);
  image(trailLayer, 0, 0);
  stroke(80);
line(0, toY(0), width, toY(0));
  if (phase === "ready") {
    drawBall(0, 0);
  }

  else if (phase === "up") {

    t += 0.05;
    let y = u * t - 0.5 * g * t * t;

    drawTrail(0, y);
    drawBall(0, y);

    if (t >= tMax) {
      t = tMax;
      phase = "top";
      drawDashed();
    }
  }

  else if (phase === "top") {

    let H = u * u / (2 * g);
    drawBall(0, H);
  }

  else if (phase === "projectile") {

    update(left);
    update(right);

    drawTrail(left.x, left.y, "red");
    drawTrail(right.x, right.y, "blue");

    drawBall(left.x, left.y, "red");
    drawBall(right.x, right.y, "blue");
  }

  updateUI();
}

// =========================

function drawBall(x, y, col = "black") {
  fill(col);
  circle(toX(x), toY(y), 12);
}

function drawTrail(x, y, col = 0) {
  trailLayer.stroke(col);
  trailLayer.point(toX(x), toY(y));
}

function drawDashed() {

  let H = u * u / (2 * g);

  trailLayer.stroke(0);

  let step = H / 20;

  for (let y = 0; y < H; y += step) {
    trailLayer.line(toX(0), toY(y), toX(0), toY(y + step / 2));
  }
}

// =========================

function update(o) {
  if (!o || o.done) return;

  o.t += 0.05;
  o.x += o.vx * 0.05;
  o.y = o.H - 0.5 * g * o.t * o.t;

  if (o.y <= 0) {
    o.y = 0;
    o.done = true;
  }
}

// =========================

function startMotion() {
  if (phase === "ready") {
    t = 0;
    phase = "up";
  }
}

function explode() {
  if (phase !== "top") return;

  let H = u * u / (2 * g);

  let mR = frac;
  let mL = 1 - frac;

  let vR = Math.sqrt((2 * E) / (mR + (mR * mR) / mL));
  let vL = -(mR / mL) * vR;

  left = { x: 0, y: H, H: H, vx: vL, t: 0 };
  right = { x: 0, y: H, H: H, vx: vR, t: 0 };

  phase = "projectile";
}

function togglePause() {
  paused = !paused;
  document.getElementById("pauseBtn").innerText = paused ? "Resume" : "Stop";
}

// =========================

function updateUI() {

  let hVal = 0;
  let s1 = "-";
  let s2 = "-";

  if (phase === "up") {
    hVal = u * t - 0.5 * g * t * t;
  }

  if (phase === "projectile") {

    if (left) {
      hVal = left.y;
      s1 = Math.abs(left.x).toFixed(2);
    }

    if (right) {
      s2 = Math.abs(right.x).toFixed(2);
    }
  }

  document.getElementById("t").innerText = t.toFixed(2);
  document.getElementById("h").innerText = hVal.toFixed(2);
  document.getElementById("s1").innerText = s1;
  document.getElementById("s2").innerText = s2;
}

// =========================

document.addEventListener("DOMContentLoaded", () => {

  const u0 = document.getElementById("u0");
  const fractionSel = document.getElementById("fraction");
  const energySel = document.getElementById("energy");

  u0.oninput = () => {
    u = +u0.value;
    document.getElementById("u0val").innerText = u;
    resetSim();
  };

  fractionSel.onchange = () => {
    frac = eval(fractionSel.value);
    resetSim();
  };

  energySel.onchange = () => {
    E = +energySel.value;
    resetSim();
  };
});
