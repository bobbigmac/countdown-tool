# Countdown Numbers Grid Visualization - Grok

Date: 25/07/2025, 08:05:32

## User

I've been thinking about visualisations to help make you better at the Countdown (ch4 tv show) numbers game, partly by representing a 'grid' of circles, that link common available number interactions visually, by connecting each set of numbers with grid lines, so the maths becomes visual knowledge by its place in the space. Think a little like the final fantasy 10 sphere grid. The main node numbers are those available to be drawn in the game (100,75,50,25,10,9,8,7,6,5,4,3,2,1) and we don't care about any number 'interaction' resulting above 999 or below 0. Can you try visualising this in html+css+js

## Grok

Here’s a solution to visualize the Countdown numbers game as a grid of circles connected by lines, inspired by the Final Fantasy X sphere grid. The visualization uses HTML, CSS, and JavaScript to represent the available numbers (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 25, 50, 75, 100) as nodes. Two nodes are connected if an arithmetic operation (addition, subtraction, multiplication, or division) between them produces another number in the set, with results constrained between 0 and 999 and adhering to the game’s rules (e.g., division must yield a positive integer).

The nodes are arranged in a circular layout for clarity, with each circle labeled by its number. Connections are drawn as lines between nodes, making the mathematical relationships visual and intuitive. This approach highlights common interactions, aiding players in recognizing useful number combinations.

Below is the implementation:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Countdown Numbers Grid</title>
  <style>
    svg {
      border: 1px solid #ccc;
      background: #f9f9f9;
    }
    circle {
      fill: lightblue;
      stroke: #333;
      stroke-width: 1;
    }
    line {
      stroke: #666;
      stroke-width: 1;
    }
    text {
      font-family: Arial, sans-serif;
      font-size: 14px;
      fill: #333;
    }
  </style>
</head>
<body>
  <svg id="grid" width="500" height="500"></svg>
  <script>
    // Define the available numbers and create a set for quick lookup
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 25, 50, 75, 100];
    const numSet = new Set(numbers);

    // SVG dimensions and layout parameters
    const svgWidth = 500;
    const svgHeight = 500;
    const centerX = svgWidth / 2;
    const centerY = svgHeight / 2;
    const radius = 200;
    const numNodes = numbers.length;
    const angleStep = 2 * Math.PI / numNodes;

    // Calculate node positions in a circular layout
    const nodePositions = numbers.map((_, i) => {
      const angle = i * angleStep;
      return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });

    // Generate edges based on valid operations
    const edges = [];
    for (let i = 0; i < numNodes; i++) {
      for (let j = i + 1; j < numNodes; j++) {
        const a = numbers[i];
        const b = numbers[j];
        // Check addition
        if (numSet.has(a + b)) {
          edges.push({ from: i, to: j });
          continue;
        }
        // Check subtraction (|a - b| to keep graph undirected)
        if (numSet.has(Math.abs(a - b))) {
          edges.push({ from: i, to: j });
          continue;
        }
        // Check multiplication
        if (numSet.has(a * b)) {
          edges.push({ from: i, to: j });
          continue;
        }
        // Check division (a / b or b / a must be integer and in set)
        if ((a % b === 0 && numSet.has(a / b)) || (b % a === 0 && numSet.has(b / a))) {
          edges.push({ from: i, to: j });
        }
      }
    }

    // Access the SVG element
    const svg = document.getElementById('grid');

    // Draw edges (lines) first so they appear behind nodes
    edges.forEach(edge => {
      const p1 = nodePositions[edge.from];
      const p2 = nodePositions[edge.to];
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', p1.x);
      line.setAttribute('y1', p1.y);
      line.setAttribute('x2', p2.x);
      line.setAttribute('y2', p2.y);
      svg.appendChild(line);
    });

    // Draw nodes (circles) and labels (text)
    numbers.forEach((num, i) => {
      const pos = nodePositions[i];
      // Draw circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', pos.x);
      circle.setAttribute('cy', pos.y);
      circle.setAttribute('r', 20);
      svg.appendChild(circle);
      // Draw text label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', pos.x);
      text.setAttribute('y', pos.y);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dy', '.3em');
      text.textContent = num;
      svg.appendChild(text);
    });
  </script>
</body>
</html>
```

This code creates an interactive SVG visualization where:
- **Nodes** are circles positioned around a central point, each representing one of the available numbers.
- **Connections** are lines drawn between nodes if an operation (addition, subtraction, multiplication, or division) results in another number from the set.
- The layout is styled with CSS for readability, using light blue circles and dark lines.

You can open this HTML file in a web browser to see the grid. The connections visually represent how numbers can interact, making it easier to spot potential moves in the Countdown numbers game, much like navigating the sphere grid in Final Fantasy X.

## User

I suppose we only really care about multiply and divide. Addition and subtraction are much easier mentally, so let's not waste the space. We can also have greyed out nodes for compound numbers (results of operations, but not in our starting available numbers)

## Grok

I'll modify the visualization to focus only on multiplication and division connections between the Countdown numbers (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 25, 50, 75, 100), as addition and subtraction are mentally easier and less critical to visualize. Additionally, I'll include greyed-out nodes for compound numbers (results of multiplication or division that are between 0 and 999 but not in the starting set). These compound nodes will help visualize intermediate results that could be used in further calculations.

The nodes will remain in a circular layout, with starting numbers in light blue and compound numbers in grey. Connections will be drawn only for multiplication and division operations that yield valid results (either in the starting set or as compound numbers). This keeps the visualization focused and reduces clutter.

Below is the updated implementation:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Countdown Numbers Grid</title>
  <style>
    svg {
      border: 1px solid #ccc;
      background: #f9f9f9;
    }
    .start-node {
      fill: lightblue;
      stroke: #333;
      stroke-width: 1;
    }
    .compound-node {
      fill: #d3d3d3;
      stroke: #333;
      stroke-width: 1;
    }
    line {
      stroke: #666;
      stroke-width: 1;
    }
    text {
      font-family: Arial, sans-serif;
      font-size: 12px;
      fill: #333;
    }
  </style>
</head>
<body>
  <svg id="grid" width="600" height="600"></svg>
  <script>
    // Define the starting numbers and create a set for quick lookup
    const startNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 25, 50, 75, 100];
    const startNumSet = new Set(startNumbers);

    // Collect compound numbers (results of multiply/divide not in startNumbers)
    const compoundNumbers = new Set();
    startNumbers.forEach(a => {
      startNumbers.forEach(b => {
        // Multiplication
        const prod = a * b;
        if (prod > 0 && prod <= 999 && !startNumSet.has(prod)) {
          compoundNumbers.add(prod);
        }
        // Division (a / b or b / a must be integer)
        if (a % b === 0) {
          const div = a / b;
          if (div > 0 && div <= 999 && !startNumSet.has(div)) {
            compoundNumbers.add(div);
          }
        }
        if (b % a === 0) {
          const div = b / a;
          if (div > 0 && div <= 999 && !startNumSet.has(div)) {
            compoundNumbers.add(div);
          }
        }
      });
    });
    const compoundArray = Array.from(compoundNumbers).sort((a, b) => a - b);

    // Combine all numbers for layout
    const allNumbers = [...startNumbers, ...compoundArray];
    const numNodes = allNumbers.length;

    // SVG dimensions and layout parameters
    const svgWidth = 600;
    const svgHeight = 600;
    const centerX = svgWidth / 2;
    const centerY = svgHeight / 2;
    const radius = 250;
    const angleStep = 2 * Math.PI / numNodes;

    // Calculate node positions in a circular layout
    const nodePositions = allNumbers.map((_, i) => {
      const angle = i * angleStep;
      return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });

    // Generate edges based on multiply and divide operations
    const edges = [];
    allNumbers.forEach((a, i) => {
      allNumbers.forEach((b, j) => {
        if (i >= j) return; // Avoid duplicate edges and self-loops
        // Multiplication
        const prod = a * b;
        const prodIndex = allNumbers.indexOf(prod);
        if (prod > 0 && prod <= 999 && prodIndex !== -1) {
          edges.push({ from: i, to: j });
          return;
        }
        // Division (a / b or b / a must be integer)
        if (a % b === 0) {
          const div = a / b;
          const divIndex = allNumbers.indexOf(div);
          if (div > 0 && div <= 999 && divIndex !== -1) {
            edges.push({ from: i, to: j });
            return;
          }
        }
        if (b % a === 0) {
          const div = b / a;
          const divIndex = allNumbers.indexOf(div);
          if (div > 0 && div <= 999 && divIndex !== -1) {
            edges.push({ from: i, to: j });
          }
        }
      });
    });

    // Access the SVG element
    const svg = document.getElementById('grid');

    // Draw edges (lines) first so they appear behind nodes
    edges.forEach(edge => {
      const p1 = nodePositions[edge.from];
      const p2 = nodePositions[edge.to];
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', p1.x);
      line.setAttribute('y1', p1.y);
      line.setAttribute('x2', p2.x);
      line.setAttribute('y2', p2.y);
      svg.appendChild(line);
    });

    // Draw nodes (circles) and labels (text)
    allNumbers.forEach((num, i) => {
      const pos = nodePositions[i];
      // Draw circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', pos.x);
      circle.setAttribute('cy', pos.y);
      circle.setAttribute('r', 15);
      circle.setAttribute('class', startNumSet.has(num) ? 'start-node' : 'compound-node');
      svg.appendChild(circle);
      // Draw text label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', pos.x);
      text.setAttribute('y', pos.y);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dy', '.3em');
      text.textContent = num;
      svg.appendChild(text);
    });
  </script>
</body>
</html>
```

This updated visualization:
- **Focuses on multiplication and division**: Connections are drawn only when two numbers produce another number (in the starting set or a compound number) via these operations.
- **Includes compound numbers**: Numbers like 12 (from 3 × 4) or 20 (from 10 × 2) appear as grey nodes, showing possible intermediate results.
- **Uses distinct styling**: Starting numbers are light blue, compound numbers are grey, and lines connect related nodes.
- **Expands the canvas**: The SVG size is increased to 600x600 to accommodate more nodes without overcrowding.

Open this HTML file in a browser to see the grid. It emphasizes the multiplication and division relationships, making it easier to trace complex operations visually, similar to navigating the Final Fantasy X sphere grid, while keeping the focus on the most challenging mental calculations in the Countdown numbers game.

## User

the nodes should be in order (starting and compound)

## Grok

I'll update the visualization to ensure that both starting numbers (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 25, 50, 75, 100) and compound numbers (results of multiplication or division between 0 and 999, not in the starting set) are arranged in numerical order around the circular grid. This means nodes will be placed in ascending order (e.g., 1, 2, 3, ..., 10, 12, ..., 25, ..., 100, ...) to make the layout more intuitive. Connections will still represent multiplication and division operations, with starting nodes in light blue and compound nodes in grey.

The artifact retains the same ID as the previous version since this is an update to the existing visualization, as requested.

```html
<!DOCTYPE html>
<html>
<head>
  <title>Countdown Numbers Grid</title>
  <style>
    svg {
      border: 1px solid #ccc;
      background: #f9f9f9;
    }
    .start-node {
      fill: lightblue;
      stroke: #333;
      stroke-width: 1;
    }
    .compound-node {
      fill: #d3d3d3;
      stroke: #333;
      stroke-width: 1;
    }
    line {
      stroke: #666;
      stroke-width: 1;
    }
    text {
      font-family: Arial, sans-serif;
      font-size: 12px;
      fill: #333;
    }
  </style>
</head>
<body>
  <svg id="grid" width="600" height="600"></svg>
  <script>
    // Define the starting numbers and create a set for quick lookup
    const startNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 25, 50, 75, 100];
    const startNumSet = new Set(startNumbers);

    // Collect compound numbers (results of multiply/divide not in startNumbers)
    const compoundNumbers = new Set();
    startNumbers.forEach(a => {
      startNumbers.forEach(b => {
        // Multiplication
        const prod = a * b;
        if (prod > 0 && prod <= 999 && !startNumSet.has(prod)) {
          compoundNumbers.add(prod);
        }
        // Division (a / b or b / a must be integer)
        if (a % b === 0) {
          const div = a / b;
          if (div > 0 && div <= 999 && !startNumSet.has(div)) {
            compoundNumbers.add(div);
          }
        }
        if (b % a === 0) {
          const div = b / a;
          if (div > 0 && div <= 999 && !startNumSet.has(div)) {
            compoundNumbers.add(div);
          }
        }
      });
    });

    // Combine and sort all numbers in ascending order
    const allNumbers = [...startNumbers, ...Array.from(compoundNumbers)].sort((a, b) => a - b);
    const numNodes = allNumbers.length;

    // SVG dimensions and layout parameters
    const svgWidth = 600;
    const svgHeight = 600;
    const centerX = svgWidth / 2;
    const centerY = svgHeight / 2;
    const radius = 250;
    const angleStep = 2 * Math.PI / numNodes;

    // Calculate node positions in a circular layout
    const nodePositions = allNumbers.map((_, i) => {
      const angle = i * angleStep;
      return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });

    // Generate edges based on multiply and divide operations
    const edges = [];
    allNumbers.forEach((a, i) => {
      allNumbers.forEach((b, j) => {
        if (i >= j) return; // Avoid duplicate edges and self-loops
        // Multiplication
        const prod = a * b;
        const prodIndex = allNumbers.indexOf(prod);
        if (prod > 0 && prod <= 999 && prodIndex !== -1) {
          edges.push({ from: i, to: j });
          return;
        }
        // Division (a / b or b / a must be integer)
        if (a % b === 0) {
          const div = a / b;
          const divIndex = allNumbers.indexOf(div);
          if (div > 0 && div <= 999 && divIndex !== -1) {
            edges.push({ from: i, to: j });
            return;
          }
        }
        if (b % a === 0) {
          const div = b / a;
          const divIndex = allNumbers.indexOf(div);
          if (div > 0 && div <= 999 && divIndex !== -1) {
            edges.push({ from: i, to: j });
          }
        }
      });
    });

    // Access the SVG element
    const svg = document.getElementById('grid');

    // Draw edges (lines) first so they appear behind nodes
    edges.forEach(edge => {
      const p1 = nodePositions[edge.from];
      const p2 = nodePositions[edge.to];
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', p1.x);
      line.setAttribute('y1', p1.y);
      line.setAttribute('x2', p2.x);
      line.setAttribute('y2', p2.y);
      svg.appendChild(line);
    });

    // Draw nodes (circles) and labels (text)
    allNumbers.forEach((num, i) => {
      const pos = nodePositions[i];
      // Draw circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', pos.x);
      circle.setAttribute('cy', pos.y);
      circle.setAttribute('r', 15);
      circle.setAttribute('class', startNumSet.has(num) ? 'start-node' : 'compound-node');
      svg.appendChild(circle);
      // Draw text label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', pos.x);
      text.setAttribute('y', pos.y);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dy', '.3em');
      text.textContent = num;
      svg.appendChild(text);
    });
  </script>
</body>
</html>
```

**Changes Made:**
- **Ordered Nodes**: The `allNumbers` array is now sorted in ascending order (`[...startNumbers, ...Array.from(compoundNumbers)].sort((a, b) => a - b)`), so nodes are placed around the circle starting from 1, 2, 3, ..., up to the largest compound number (e.g., 900 from 9 × 100).
- **Retained Features**: Connections are still limited to multiplication and division, with starting nodes in light blue and compound nodes in grey. The SVG size remains 600x600, and the layout is circular with a radius of 250 pixels.
- **No Other Changes**: The logic for generating edges, styling, and rendering remains unchanged to focus solely on the ordering requirement.

Open this HTML file in a browser to see the updated grid. The nodes now progress in numerical order around the circle, making it easier to follow the sequence of numbers and their multiplication/division relationships, enhancing the visual analogy to the Final Fantasy X sphere grid for the Countdown numbers game.

