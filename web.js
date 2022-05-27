const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// API Request:
// {
//   "_links": {
//     "self": {
//       "href": "https://YOUR_SERVICE_URL"
//     }
//   },
//   "arena": {
//     "dims": [4,3], // width, height
//     "state": {
//       "https://A_PLAYERS_URL": {
//         "x": 0, // zero-based x position, where 0 = left
//         "y": 0, // zero-based y position, where 0 = top
//         "direction": "N", // N = North, W = West, S = South, E = East
//         "wasHit": false,
//         "score": 0
//       }
//       ... // also you and the other players
//     }
//   }
// }

app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('Let the battle begin!');
});

// Facing Direction first -> 
// N -> y--
// S -> y++
// E -> x++
// W -> x--

const Direction = {
  NORTH: "N",
  SOUTH: "S",
  EAST: "E",
  WEST: "W"
}

const moves = ['F', 'L', 'R'];

// Throw distance: 3 unit

/** @returns {Array} */
const _filterEnemiesByDirection = (direction, enemiesList, selfState) => {
  return enemiesList.filter((enemy)=>{
    switch (direction) {
      case Direction.NORTH: return enemy[1].y - selfState.y < 0;
      case Direction.SOUTH: return enemy[1].y - selfState.y > 0;
      case Direction.EAST: return enemy[1].x - selfState.x > 0;
      case Direction.WEST: return enemy[1].x - selfState.x < 0;
      default: return true;
    }
  })
}

const THROWABLE_UNIT = 3;
const THROWABLE_THRESHOLD = 4;

app.post('/', function (req, res) {
  console.log(req.body);
  const {_links: {self: {href}}, arena: {dims, state}} = req.body;
  const _selfKey = href;
  const _selfState = state[_selfKey];
  
  const nearEnemies = Object.entries(state).filter((enemy)=>{
    return enemy[1].x === _selfState.x ^ enemy[1].y === _selfState.y
  });

  // Check facing direction, near 3 unit
  const { direction, x, y } = _selfState;
  const frontEnemy = _filterEnemiesByDirection(direction, nearEnemies, _selfState).find((enemy)=>(Math.abs((enemy[1].y - y) + (enemy[1].x - x)) < THROWABLE_UNIT));
  if (frontEnemy !== undefined) {
    // if (!frontEnemy[1].wasHit) {
      res.send("T");
      return;
    // }
  }
  

  res.send(moves[Math.floor(Math.random() * moves.length)]);
});

app.listen(process.env.PORT || 8080);
