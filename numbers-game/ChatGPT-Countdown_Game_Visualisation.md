# Countdown Game Visualisation

#### You:
I've been thinking about visualisations to help make you better at the Countdown (ch4 tv show) numbers game, partly by representing a 'grid' of circles, that link common available number interactions visually, by connecting each set of numbers with grid lines, so the maths becomes visual knowledge by its place in the space. Think a little like the final fantasy 10 sphere grid. The main node numbers are those available to be drawn in the game (100,75,50,25,10,9,8,7,6,5,4,3,2,1) and we don't care about any number 'interaction' resulting above 999 or below 0. Can you try visualising this in html+css+js

#### ChatGPT:
Here's a complete working HTML+CSS+JS implementation of a visualisation inspired by the Countdown numbers game, showing how numbers interact via basic arithmetic operations. It uses a force-directed layout to position nodes and lines based on shared results from operations between source numbers (1–100, limited to game rules).

Each pair of numbers (from the set) is connected if one of the four basic operations produces another number in the valid range (1–999). Each interaction is visualised as a line between nodes.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Countdown Numbers Grid</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      background: #111;
      overflow: hidden;
      height: 100%;
    }

    canvas {
      display: block;
    }
  </style>
</head>
<body>
<canvas id="canvas"></canvas>
<script>
  const numbers = [100, 75, 50, 25, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
  const operations = [
    (a, b) => a + b,
    (a, b) => a - b,
    (a, b) => a * b,
    (a, b) => b !== 0 && a % b === 0 ? a / b : null,
  ];

  const maxResult = 999;
  const minResult = 1;

  const nodes = numbers.map((n, i) => ({
    id: n,
    x: Math.cos((i / numbers.length) * 2 * Math.PI) * 300 + window.innerWidth / 2,
    y: Math.sin((i / numbers.length) * 2 * Math.PI) * 300 + window.innerHeight / 2,
    vx: 0,
    vy: 0
  }));

  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const links = [];

  for (let i = 0; i < numbers.length; i++) {
    for (let j = 0; j < numbers.length; j++) {
      if (i === j) continue;
      const a = numbers[i];
      const b = numbers[j];

      for (const op of operations) {
        const r = op(a, b);
        if (r && Number.isInteger(r) && r >= minResult && r <= maxResult && nodeMap.has(r)) {
          links.push({ source: a, target: r });
        }
      }
    }
  }

  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener("resize", resize);

  function update() {
    // basic physics
    for (const link of links) {
      const a = nodeMap.get(link.source);
      const b = nodeMap.get(link.target);
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const force = (dist - 100) * 0.001;

      const fx = dx * force;
      const fy = dy * force;

      a.vx += fx;
      a.vy += fy;
      b.vx -= fx;
      b.vy -= fy;
    }

    for (const node of nodes) {
      node.vx *= 0.85;
      node.vy *= 0.85;
      node.x += node.vx;
      node.y += node.vy;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#444";
    ctx.lineWidth = 1;
    for (const link of links) {
      const a = nodeMap.get(link.source);
      const b = nodeMap.get(link.target);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    for (const node of nodes) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI);
      ctx.fillStyle = "#0ff";
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.stroke();

      ctx.fillStyle = "#000";
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(node.id, node.x, node.y);
    }
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  loop();
</script>
</body>
</html>
```

Let me know if you want specific operations highlighted in different colours, or if you want the grid to be laid out in a more geometric or semantic way (e.g., proximity based on interaction count or arithmetic structure).
