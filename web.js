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
const _filterEnemiesByDirection = (direction, enemiesList, selfState, distance = THROWABLE_THRESHOLD) => {
  return enemiesList.filter((enemy)=>{
    const diffY = enemy[1].y - selfState.y;
    const diffX = enemy[1].x - selfState.x
    switch (direction) {
      case Direction.NORTH: return diffY < 0 && -distance < diffY;  
      case Direction.SOUTH: return diffY > 0 && diffY < distance;
      case Direction.EAST: return diffX > 0 && diffX < distance;
      case Direction.WEST: return diffX < 0 && -distance < diffX;
      default: return true;
    }
  })
}

const THROWABLE_UNIT = 3;
const THROWABLE_THRESHOLD = 4;

let stackStep = [];
const changeDirection = ["L", "R", "F"];

app.post("/manual", function (req, res) {
  stackStep = req.body;
  res.send("OK");
});

app.post('/', function (req, res) {
  // console.log(req.body);
  if (stackStep.length > 0) {
    res.send(stackStep.pop());
    return;
  } 
  const {_links: {self: {href}}, arena: {dims, state}} = req.body;
  const _selfKey = href;
  const _selfState = state[_selfKey];
  
  const nearEnemies = Object.entries(state).filter((enemy)=>{
    return enemy[1].x === _selfState.x ^ enemy[1].y === _selfState.y
  });

  // Check facing direction, near 3 unit
  const { direction, x, y } = _selfState;

  // Dodge Logic

  // Shoot logic
  const frontEnemy = _filterEnemiesByDirection(direction, nearEnemies, _selfState).find((enemy)=>(Math.abs((enemy[1].y - y) + (enemy[1].x - x)) < THROWABLE_UNIT));

  if (_selfState.wasHit) {
    if (frontEnemy !== undefined) {
      if (Math.abs((frontEnemy[1].y - y) + (frontEnemy[1].x - x)) > 1) {
        res.send("F");
        return;
      } else {
        stackStep.push("F");
        res.send(changeDirection[Math.floor(Math.random() * changeDirection.length)]);
        return;
      }
    } else {
      if (Direction.EAST ===  direction && x > dims[0] - 2) {
        stackStep.push("L", "F");
        res.send("L");
        return;
      } else if (Direction.WEST ===  direction && x < 1) {
        stackStep.push("L", "F");
        res.send("L");
        return;
      }

      if (Direction.NORTH ===  direction && y < 1) {
        stackStep.push("L", "F");
        res.send("L");
        return;
      } else if (Direction.SOUTH === direction && y > dims[1] - 2) {
        stackStep.push("L", "F");
        res.send("L");
        return;
      }

      stackStep.push("F");
      res.send(changeDirection[Math.floor(Math.random() * changeDirection.length)]);
      return;
    }
    
  }

  if (frontEnemy !== undefined) {
      res.send("T");
      return;
  }
  
  if (Direction.EAST ===  direction && x > dims[0] - 2) {
    stackStep.push("L", "F");
    res.send("L");
    return;
  } else if (Direction.WEST ===  direction && x < 1) {
    stackStep.push("L", "F");
    res.send("L");
    return;
  }

  if (Direction.NORTH ===  direction && y < 1) {
    stackStep.push("L", "F");
    res.send("L");
    return;
  } else if (Direction.SOUTH === direction && y > dims[1] - 2) {
    stackStep.push("L", "F");
    res.send("L");
    return;
  }

  res.send(moves[Math.floor(Math.random() * moves.length)]);
});

app.listen(process.env.PORT || 8080);
