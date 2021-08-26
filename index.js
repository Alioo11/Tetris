const BOARD_WIDTH = 16;
const BOARD_HEIGHT = 16;
let direction = "down";
const colors = [
  "#FF5555",
  "#55ff55",
  "#5555ff",
  "#edea39",
  "#39edb7",
  "#ff8030",
];

function getRandomArbitrary(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

let cells = document.querySelectorAll(".cell");
window.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowUp":
      direction = "up";
      break;
    case "ArrowDown":
      direction = "down";
      break;
    case "ArrowLeft":
      direction = "left";
      break;
    case "ArrowRight":
      direction = "right";
      break;
    case "b":
      makeBrick();
      break;
    case "x":
      stop();
      break;
  }
  currentBrick.move(direction);
});

class Brick {
  constructor(id, indexCell) {
    this.id = id;
    this.indexCell = indexCell;
  }
  print() {
    this.pattern.forEach((cell) => {
      cells[cell].style.backgroundColor = this.color;
      cells[cell].setAttribute("key", this.id);
    });
  }
  remove() {
    this.pattern.forEach((cell) => {
      cells[cell].style.backgroundColor = "#3c3c3c";
      cells[cell].setAttribute("key", 0);
    });
  }
  Up() {
    return this.pattern.map((cell) => (cell -= BOARD_WIDTH));
  }
  Down() {
    return this.pattern.map((cell) => (cell += BOARD_WIDTH));
  }
  Left() {
    return this.pattern.map((cell) => (cell -= 1));
  }
  Right() {
    return this.pattern.map((cell) => (cell += 1));
  }
  isValidMove(direction) {
    let shadow = this.shadow(direction);
    let isValid = true;
    switch (direction) {
      case "up": {
        shadow.forEach((cell) => {
          if (cell <= 0) isValid = false;
        });
        break;
      }
      case "down": {
        shadow.forEach((cell) => {
          if (cell >= BOARD_HEIGHT * BOARD_WIDTH) isValid = false;
        });
        break;
      }
      case "right": {
        shadow.forEach((cell) => {
          if (cell % BOARD_WIDTH === 0) {
            isValid = false;
          }
        });
        break;
      }
      case "left": {
        let leftWall = [];
        for (let i = 0; i < BOARD_HEIGHT; i++) {
          leftWall.push(BOARD_WIDTH * i - 1);
        }
        shadow.forEach((cell) => {
          if (leftWall.includes(cell)) {
            isValid = false;
          }
        });
        break;
      }
    }
    /********************************** check if hits an othe block****************************************** */
    if (isValid) {
      shadow.forEach((cell) => {
        if (cells[cell].getAttribute("key") != 0) isValid = false;
      });
    }
    return isValid;
  }
  shadow(direction) {
    let shadow = [];
    switch (direction) {
      case "up": {
        shadow = [...this.Up()];
        break;
      }
      case "down": {
        shadow = [...this.Down()];
        break;
      }
      case "left": {
        shadow = [...this.Left()];
        break;
      }
      case "right": {
        shadow = [...this.Right()];
        break;
      }
    }
    shadow = shadow.filter((n) => !this.pattern.includes(n));
    return shadow;
  }
  move(direction) {
    if (this.isValidMove(direction)) {
      this.remove();
      switch (direction) {
        case "down": {
          this.pattern = this.Down();
          break;
        }
        case "up": {
          this.pattern = this.Up();
          break;
        }
        case "left": {
          this.pattern = this.Left();
          break;
        }
        case "right": {
          this.pattern = this.Right();
          break;
        }
        default: {
          throw new Error(" unknown direction");
        }
      }
      this.print();
    }
  }
  angleConversion(angle, type = true) {
    if (type) {
      return (Math.PI / 180) * angle;
    } else {
      return Math.round((180 / Math.PI) * angle);
    }
  }
  celltoMatrix(cellIndex) {
    let y = cellIndex % BOARD_WIDTH;
    let x = cellIndex - Math.floor(cellIndex / BOARD_WIDTH) * BOARD_WIDTH;
    return [x, y];
  }
  calculateDeg(height, width) {
    return Math.round((Math.atan(height / width) * 180) / Math.PI);
  }
  fidnDegree(cellIndex) {
    debugger;
    const povitcordinant = this.celltoMatrix(this.pattern[this.indexCell]);
    const thisCell = this.celltoMatrix(cellIndex);
    // const diffCells = [
    //   povitcordinant[0] - thisCell[0],
    //   povitcordinant[1] - thisCell[1],
    // ];
    console.log("this is the poivot" + povitcordinant);
    console.log("this is the this cell" + thisCell);
  }
}
class StrBrick extends Brick {
  constructor(id, indexCell, color) {
    super(id, indexCell);
    this.pattern = [5, 6, 7, 8];
    this.color = color;
  }
}
class Lbrick extends Brick {
  constructor(id, indexCell, color) {
    super(id, indexCell);
    this.pattern = [22, 6, 7, 8];
    this.color = color;
  }
}
class boxBrick extends Brick {
  constructor(id, indexCell, color) {
    super(id, indexCell);
    this.pattern = [6, 7, 22, 23];
    this.color = color;
  }
}
class halfStraight extends Brick {
  constructor(id, indexCell, color) {
    super(id, indexCell);
    this.pattern = [6, 22, 23, 38];
    this.color = color;
  }
}
class curlyBrick extends Brick {
  constructor(id, indexCell, color) {
    super(id, indexCell);
    this.pattern = [38, 22, 23, 7];
    this.color = color;
  }
}

const levelCheck = () => {
  const filledLevels = [];
  for (let i = 0; i < BOARD_HEIGHT; i++) {
    let isFullLevel = true;
    for (let j = 0; j < BOARD_WIDTH; j++) {
      if (cells[BOARD_HEIGHT * i + j].getAttribute("key") == 0)
        isFullLevel = false;
    }
    isFullLevel ? filledLevels.push(i) : filledLevels.push();
  }
  return filledLevels;
};
const delLevel = (levels) => {
  for (let i = 0; i < levels.length; i++) {
    for (let j = 0; j < BOARD_WIDTH; j++) {
      cells[BOARD_HEIGHT * levels[i] + j].setAttribute("key", 0);
      cells[BOARD_HEIGHT * levels[i] + j].style.backgroundColor = "#3c3c3c";
    }
  }
};
const gravity = (levels) => {
  if (levels) {
    let counter = 0;
    for (let i = BOARD_HEIGHT - 2; i >= 0; i--) {
      if (levels.includes(i + 1)) counter++;
      if (counter > 0) {
        fallDown(i, counter);
      }
    }
  }
};
const fallDown = (levelIndex, fallLevel) => {
  for (let i = 0; i < BOARD_WIDTH; i++) {
    cells[levelIndex * BOARD_WIDTH + i + fallLevel * BOARD_WIDTH].setAttribute(
      "key",
      cells[levelIndex * BOARD_WIDTH + i].getAttribute("key")
    );
    cells[
      levelIndex * BOARD_WIDTH + i + fallLevel * BOARD_WIDTH
    ].style.backgroundColor =
      cells[levelIndex * BOARD_WIDTH + i].style.backgroundColor;
    cells[levelIndex * BOARD_WIDTH + i].style.backgroundColor = "#3c3c3c";
    cells[levelIndex * BOARD_WIDTH + i].setAttribute("key", 0);
  }
};

let currentBrick;
let interval;

const stop = () => {
  clearInterval(interval);
};

const brickCycle = () => {
  let choiseBrick = getRandomArbitrary(0, 4);
  switch (choiseBrick) {
    case 0: {
      currentBrick = new StrBrick(
        getRandomArbitrary(0, 100),
        2,
        colors[getRandomArbitrary(0, colors.length - 1)]
      );
      break;
    }
    case 1: {
      currentBrick = new Lbrick(
        getRandomArbitrary(0, 100),
        2,
        colors[getRandomArbitrary(0, colors.length - 1)]
      );
      break;
    }
    case 2: {
      currentBrick = new boxBrick(
        getRandomArbitrary(0, 100),
        2,
        colors[getRandomArbitrary(0, colors.length - 1)]
      );
      break;
    }
    case 3: {
      currentBrick = new halfStraight(
        getRandomArbitrary(0, 100),
        2,
        colors[getRandomArbitrary(0, colors.length - 1)]
      );
      break;
    }
    case 4: {
      currentBrick = new curlyBrick(
        getRandomArbitrary(0, 100),
        2,
        colors[getRandomArbitrary(0, colors.length - 1)]
      );
      break;
    }
  }
  currentBrick.print();
  clearInterval(interval);
  interval = setInterval(() => {
    currentBrick.move("down");
    if (!currentBrick.isValidMove("down")) {
      let selectedLevels = levelCheck();
      delLevel(selectedLevels);
      gravity(selectedLevels);
      brickCycle();
    }
  }, 500);
};
