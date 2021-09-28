let result = [];

for (let i = 0; i < 26; i++) {
  result.push({
    name: String.fromCharCode(i + 65),
    x: Math.floor(Math.random() * 800) + 50,
    y: Math.floor(Math.random() * 400) + 50,
    adjacentVertices: [],
  });
}

for (let i = 0; i < 26; i++) {
  result.push({
    name: String.fromCharCode(i + 97),
    x: Math.floor(Math.random() * 800) + 50,
    y: Math.floor(Math.random() * 400) + 50,
    adjacentVertices: [],
  });
}

let fs = require("fs");

fs.writeFileSync("./vertices-2.json", JSON.stringify(result, undefined, "  "));
