interface Vertex {
  id: number;
  name: string;
  x: number;
  y: number;
  adjacentVertices: Array<number>;
}

const vertices: Array<Vertex> = [
  {
    id: 1,
    name: "A",
    x: 351,
    y: 358,
    adjacentVertices: [6, 8],
  },
  {
    id: 2,
    name: "B",
    x: 440,
    y: 170,
    adjacentVertices: [2, 3, 4, 6],
  },
  {
    id: 3,
    name: "C",
    x: 460,
    y: 27,
    adjacentVertices: [2, 5],
  },
  {
    id: 4,
    name: "D",
    x: 634,
    y: 279,
    adjacentVertices: [2, 8],
  },
  {
    id: 5,
    name: "E",
    x: 848,
    y: 195,
    adjacentVertices: [3, 8],
  },
  {
    id: 6,
    name: "F",
    x: 80,
    y: 101,
    adjacentVertices: [1, 2, 7],
  },
  {
    id: 7,
    name: "G",
    x: 60,
    y: 300,
    adjacentVertices: [6],
  },
  {
    id: 8,
    name: "H",
    x: 750,
    y: 400,
    adjacentVertices: [1, 4, 5],
  },
];

const locationNames = ["A", "B", "C", "D", "E", "F", "G", "H"];

let canvas = create("canvas", { width: 900, height: 500 }) as HTMLCanvasElement;

let fromSelector = create(
  "select",
  null,
  locationNames.map((s) =>
    create("option", {
      value: vertices.find((val) => val.name == s)?.id,
      innerText: s,
    })
  )
) as HTMLSelectElement;

let toSelector = create(
  "select",
  null,
  locationNames.map((s) =>
    create("option", {
      value: vertices.find((val) => val.name == s)?.id,
      innerText: s,
    })
  )
) as HTMLSelectElement;

let div = create("div", null, [
  canvas,
  create("br"),
  create("div", { className: "controls" }, [
    create("span", null, ["From: ", fromSelector]),
    create("span", null, ["To: ", toSelector]),
    create("button", {
      innerText: "▶ Find Shortest Path",
      onclick: () => {
        let ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        displayBaseLines();

        let from = Number(fromSelector.value);
        let to = Number(toSelector.value);

        displayShortestPath(from, to);
        displayNodes();
      },
    }),
  ]),
]);

document.body.appendChild(div);

displayBaseLines();
displayNodes();

function displayBaseLines() {
  let ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

  for (let vertex of vertices) {
    const { x, y, adjacentVertices } = vertex;

    for (let id of adjacentVertices) {
      let adjVertex = vertices.find((v) => id == v.id) as Vertex;

      ctx.moveTo(x, y);
      ctx.lineTo(adjVertex.x, adjVertex.y);
      ctx.stroke();
    }
  }
}

function displayShortestPath(from: number, to: number) {
  if (from == to) return;

  let ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  let shortestPath = dijkstra(vertices, from, to);

  ctx.moveTo(shortestPath[0].x, shortestPath[0].y);
  ctx.beginPath();
  ctx.lineWidth = 5;
  ctx.strokeStyle = "red";

  for (let point of shortestPath) {
    ctx.lineTo(point.x, point.y);
  }

  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "black";
}

function displayNodes() {
  let ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  ctx.font = "28px 'Open Sans'";

  for (let v of vertices) {
    const { x, y, name } = v;

    ctx.strokeStyle = "black";
    ctx.fillStyle = "black";

    ctx.moveTo(x, y);
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, 7);
    ctx.fill();

    ctx.strokeStyle = "white";
    ctx.fillStyle = "white";
    ctx.fillText(name, x - 9, y + 10);
    ctx.strokeText(name, x - 9, y + 10);
  }

  ctx.strokeStyle = "black";
  ctx.fillStyle = "black";
}

function dijkstra(vertices: Array<Vertex>, from: number, to: number) {
  interface DijkstraNode extends Vertex {
    distance: number;
    previous: number | undefined;
  }

  let graphNodes = new Map<number, DijkstraNode>();
  let results = new Map<number, DijkstraNode>();

  for (let v of vertices) {
    graphNodes.set(v.id, {
      distance: Infinity,
      previous: undefined,
      ...v,
    });
  }

  (graphNodes.get(from) as DijkstraNode).distance = 0;

  while (graphNodes.size > 0) {
    let u = minimumDistanceNode(graphNodes);

    results.set(u.id, u);
    graphNodes.delete(u.id);

    for (let adjNodeId of u.adjacentVertices) {
      if (graphNodes.has(adjNodeId)) {
        let v = graphNodes.get(adjNodeId) as DijkstraNode;

        let alt = u.distance + distanceBetween(u, v);

        if (alt < v.distance) {
          v.distance = alt;
          v.previous = u.id;
        }
      }
    }
  }

  let destination = results.get(to) as DijkstraNode;

  let stack: Array<{ x: number; y: number }> = [
    {
      x: destination.x,
      y: destination.y,
    },
  ];

  for (
    let curr = destination, next: DijkstraNode;
    curr.previous !== undefined;
    curr = next
  ) {
    next = results.get(curr.previous) as DijkstraNode;
    stack.push({
      x: next.x,
      y: next.y,
    });
  }

  return stack;

  function distanceBetween(u: DijkstraNode, v: DijkstraNode) {
    return Math.sqrt(Math.pow(u.x - v.x, 2) + Math.pow(u.y - v.y, 2));
  }

  function minimumDistanceNode(map: Map<number, DijkstraNode>) {
    return Array.from(map.values()).reduce((prev, curr) =>
      prev.distance < curr.distance ? prev : curr
    );
  }
}

/**
 * A helper function that creates and returns an HTML Element of the type `type`
 *
 * ---
 * @param type Type of `HTMLElement` to be created
 * @param props Optional properties of the `HTMLElement` to be created
 * @param children Optional HTML Elements to be assigned as children of this element
 *
 * ---
 * @returns {HTMLElement} An `HTMLElement` object
 */
function create(
  type: string,
  props?: any,
  children?: Array<HTMLElement | string>
) {
  if (!type) throw new TypeError("Empty HTMLElement type: " + type);
  let dom = document.createElement(type);
  if (props) Object.assign(dom, props);
  if (children) {
    for (let child of children) {
      if (typeof child != "string") dom.appendChild(child);
      else dom.appendChild(document.createTextNode(child));
    }
  }
  return dom;
}
