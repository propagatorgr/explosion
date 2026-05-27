let g = 10;

let phase = "ready";
let paused = false;

let u = 20;
let Ebase = 10;   // βασική μονάδα Ε
let Emult = 1;    // 1,2,4,8 από dropdown
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

// ✅ SCALE (με ενέργεια)
function computeScale() {

  let h = u * u / (2 * g);
  let tFall = u / g;

  let mR = frac;
  let mL = 1 - frac;

  let E = Emult * Ebase;

  let vR = Math.sqrt((2 * E) / (mR + (mR * mR) / mL));
  let vL = Math.abs((mR / mL) * vR);

  let Smax = Math.max(vR, vL) * tFall;

 let usableWidth = (width < 600) ? (width - 60) : (width * 0.65);
let scaleX = usableWidth / Smax;

 let scaleY = height * 0.80 / h;

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
  document.getElementById("fraction").disabled = false;
  document.getElementById("energy").disabled = false;
  document.getElementById("u0").disabled = false;

}

// =========================

function draw() {

  if (paused) return;

  background(220);
  image(trailLayer, 0, 0);

  // δάπεδο
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
  circle(toX(x), toY(y) - 6, 12);
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
    document.getElementById("fraction").disabled = true;
    document.getElementById("energy").disabled = true;
    document.getElementById("u0").disabled = true;
  }
}

// ✅ explode με ενέργεια (σωστή φυσική)
function explode() {

  if (phase !== "top") return;

  let H = u * u / (2 * g);

  let mR = frac;
  let mL = 1 - frac;

  let E = Emult * Ebase;

  let vR = Math.sqrt((2 * E) / (mR + (mR * mR) / mL));
  let vL = -(mR / mL) * vR;

  left = { x: 0, y: H, H: H, vx: vL, t: 0 };
  right = { x: 0, y: H, H: H, vx: vR, t: 0 };

  phase = "projectile";
}

window.toggleTheory = function() {
  let div = document.getElementById("theoryOverlay");
  if (!div) return;

  div.classList.toggle("active");
}


function togglePause() {
  paused = !paused;
  document.getElementById("pauseBtn").innerText = paused ? "Resume" : "Stop";
}
function toFraction(x) {

  const tolerance = 1e-6;
  let h1 = 1, h2 = 0;
  let k1 = 0, k2 = 1;
  let b = x;

  do {
    let a = Math.floor(b);
    let aux = h1;
    h1 = a * h1 + h2;
    h2 = aux;
    aux = k1;
    k1 = a * k1 + k2;
    k2 = aux;
    b = 1 / (b - a);
  } while (Math.abs(x - h1 / k1) > x * tolerance);

  return h1 + "/" + k1;
}

// =========================
// ✅ PANEL: μόνο λόγοι
function updateUI() {

  let hVal = 0;

  if (phase === "up") {
    hVal = u * t - 0.5 * g * t * t;
  }
  if (phase === "top") {
  hVal = u * u / (2 * g);
}
  if (phase === "projectile" && left && right) {
    hVal = left.y;
  }

  // ✅ λόγοι (ανεξάρτητοι από χρόνο!)
  
  document.getElementById("t").innerText = t.toFixed(2);
  document.getElementById("h").innerText = hVal.toFixed(2);

  let ratio = (1 - frac) / frac;
let fracText = toFraction(ratio);

let rs = document.getElementById("ratioS");
if (rs) rs.innerText = fracText;

let ru = document.getElementById("ratioU");
if (ru) ru.innerText = fracText;

let re = document.getElementById("ratioE");
if (re) re.innerText = fracText;

 
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
    Emult = +energySel.value;
    resetSim();
  };

});
