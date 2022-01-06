const BOARD_WIDTH = 16;
const BOARD_HEIGHT = 16;
let score = 0;
let direction = "down";
const colors = [
  "#FF5555",
  "#55ff55",
  "#5555ff",
  "#edea39",
  "#39edb7",
  "#ff8030",
];

const generateColor = ()=>{
  const generateRandomCode = ()=> Math.floor(Math.random()*1000%256)
  return `rgb(${generateRandomCode()},${generateRandomCode()},${generateRandomCode()})`
}

function getRandomArbitrary(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}
let gameover = document.querySelector(".gameOver");
let replay = document.querySelector(".replay");
let tetris = document.querySelector(".tetris");
let scoreCount = document.querySelectorAll(".scoreSpan");
let startBtn = document.getElementById("start");
let blurePage = document.getElementsByClassName("blurBackground")[0];
let guidePage = document.getElementsByClassName("guidePage")[0];

const gotIt = () => {
  tetris.style.filter = "none";
  startBtn.style.filter = "none";

  blurePage.style.display = "none";
  guidePage.style.display = "none";
};

replay.addEventListener("click", () => {
  location.reload();
});

scoreCount.forEach((item) => (item.innerHTML = score));

startBtn.addEventListener(
  "click",
  () => {
    brickCycle();
  },
  { once: true }
);

const UpdateScore = (score) => {
  scoreCount.forEach((item) => {
    item.innerHTML = parseInt(item.innerHTML) + score;
  });
};

let cells = document.querySelectorAll(".cell");
window.addEventListener("keydown", (e) => {
  let validKey = false;
  if (e.key === "e") {
    currentBrick.rotate("right");
    validKey = true;
  } else if (e.key === "q") {
    currentBrick.rotate("left");
    validKey = true;
  } else {
    switch (e.key) {
      case "w":
        direction = "up";
        validKey = true;
        break;
      case "s":
        direction = "down";
        validKey = true;
        break;
      case "a":
        direction = "left";
        validKey = true;
        break;
      case "d":
        direction = "right";
        validKey = true;
        break;
      case "b":
        makeBrick();
        break;
      case "x":
        stop();
        break;
    }
    if (validKey) {
      currentBrick.move(direction);
    }
  }
});

class Brick {
  constructor(id, pivot) {
    this.id = id;
    this.pivot = pivot;
    this.rotateStatus = 0;
  }
  rotate(rotateDirection) {
    if (this.isValidRotation(rotateDirection)) {
      this.remove();
      this.rotateStatus = this.preRotate(rotateDirection);
      this.print();
    }
  }
  preRotate(rotateDirection) {
    let tempRotation = this.rotateStatus;
    switch (rotateDirection) {
      case "right": {
        tempRotation = tempRotation - 1;
        if (tempRotation === -1) tempRotation = 3;
        break;
      }
      case "left": {
        tempRotation = tempRotation + 1;
        if (tempRotation === 4) tempRotation = 0;
        break;
      }
    }
    return tempRotation;
  }
  isValidRotation(rotateDirection) {
    let isValidRotate = true;
    let beforeRotate = this.rotateStatus;
    let afterRotate = this.preRotate(rotateDirection);
    let beforeRotateState = this.updatePatternFromPivot(beforeRotate);
    let afterRotateState = this.updatePatternFromPivot(afterRotate);

    let heightDiff = afterRotateState.map((item, idx) => {
      return Math.abs(
        Math.floor(item / BOARD_WIDTH) -
          Math.floor(beforeRotateState[idx] / BOARD_WIDTH)
      );
    });
    let widthDiff = afterRotateState.map((item, idx) => {
      return Math.abs(
        Math.floor(item % BOARD_WIDTH) -
          Math.floor(beforeRotateState[idx] % BOARD_WIDTH)
      );
    });

    for (let i = 0; i < afterRotateState.length; i++) {
      if (afterRotateState[i] < 0) {
        isValidRotate = false;
      }
      if (Math.floor(afterRotateState[i] / BOARD_WIDTH) >= BOARD_HEIGHT)
        isValidRotate = false;

      // if (heightDiff[i] !== 0) {
      if (widthDiff[i] > BOARD_WIDTH - 4) {
        isValidRotate = false;
      }
      // }
      if (isValidRotate) {
        if (cells[afterRotateState[i]].getAttribute("key") != this.id) {
          if (cells[afterRotateState[i]].getAttribute("key") != 0) {
            isValidRotate = false;
          }
        }
      }
    }

    return isValidRotate;
  }
  print() {
    let updatedBrickState = this.updatePatternFromPivot(this.rotateStatus);
    updatedBrickState.forEach((cell) => {
      cells[cell].style.backgroundColor = this.color;
      cells[cell].setAttribute("key", this.id);
    });
  }
  remove() {
    let updatedBrickState = this.updatePatternFromPivot(this.rotateStatus);
    updatedBrickState.forEach((cell) => {
      cells[cell].style.backgroundColor = "#3c3c3c";
      cells[cell].setAttribute("key", 0);
    });
  }
  Up() {
    let temp = this.pivot;
    return (temp -= BOARD_WIDTH);
  }
  Down() {
    let temp = this.pivot;
    return (temp += BOARD_WIDTH);
  }
  Left() {
    let temp = this.pivot;
    return (temp -= 1);
  }
  Right() {
    let temp = this.pivot;
    return (temp += 1);
  }
  updatePatternFromPivot(rotateStatus) {
    return this.pattern[rotateStatus].map((cell) => {
      return (cell += this.pivot);
    });
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
      shadow = shadow.filter((cell) => {
        if (cells[cell].getAttribute("key") != this.id) {
          return cell;
        }
      });
      shadow.forEach((cell) => {
        if (cells[cell].getAttribute("key") != 0) isValid = false;
      });
    }
    return isValid;
  }
  shadow(direction) {
    let shadow;
    let shadowArray = [];
    switch (direction) {
      case "up": {
        shadow = this.Up();
        break;
      }
      case "down": {
        shadow = this.Down();
        break;
      }
      case "left": {
        shadow = this.Left();
        break;
      }
      case "right": {
        shadow = this.Right();
        break;
      }
    }

    shadowArray = this.pattern[this.rotateStatus].map((cell) => {
      return (cell += shadow);
    });

    return shadowArray;
  }
  move(direction) {
    if (this.isValidMove(direction)) {
      this.remove();
      switch (direction) {
        case "down": {
          this.pivot = this.Down();
          break;
        }
        case "up": {
          this.pivot = this.Up();
          break;
        }
        case "left": {
          this.pivot = this.Left();
          break;
        }
        case "right": {
          this.pivot = this.Right();
          break;
        }
        default: {
          throw new Error(" unknown direction");
        }
      }
      this.print();
    }
  }
}

class StrBrick extends Brick {
  constructor(id, pivot, color) {
    super(id, pivot);
    this.pattern = [
      [-1, 0, 1, 2],
      [-16, 0, 16, 32],
      [-1, 0, 1, 2],
      [-16, 0, 16, 32],
    ];
    this.color = color;
  }
}
class Lbrick extends Brick {
  constructor(id, pivot, color) {
    super(id, pivot);
    this.pattern = [
      [16, 0, 1, 2],
      [-1, 0, 16, 32],
      [-2, -1, 0, -16],
      [-32, -16, 0, 1],
    ];
    this.color = color;
  }
}
class boxBrick extends Brick {
  constructor(id, pivot, color) {
    super(id, pivot);
    this.pattern = [
      [6, 7, 22, 23],
      [6, 7, 22, 23],
      [6, 7, 22, 23],
      [6, 7, 22, 23],
    ];
    this.color = color;
  }
}
class halfStraight extends Brick {
  constructor(id, pivot, color) {
    super(id, pivot);
    this.pattern = [
      [-16, 0, 1, 17],
      [0, 1, 15, 16],
      [0, -1, -17, 16],
      [-1, 0, -16, -15],
    ];
    this.color = color;
  }
}
class curlyBrick extends Brick {
  constructor(id, pivot, color) {
    super(id, pivot);
    this.pattern = [
      [-1, 0, -16, 16],
      [-1, 0, 16, 1],
      [1, 0, 16, -16],
      [-1, 0, -16, 1],
    ];
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

const test = () => {
  currentBrick = new StrBrick(
    getRandomArbitrary(0, 100),
    6,
    generateColor()
  );
};

const brickCycle = () => {
  let choiseBrick = getRandomArbitrary(0, 4);
  switch (choiseBrick) {
    case 0: {
      currentBrick = new StrBrick(
        getRandomArbitrary(0, 100),
        22,
        generateColor()
      );
      break;
    }
    case 1: {
      currentBrick = new Lbrick(
        getRandomArbitrary(0, 100),
        22,
        generateColor()
      );
      break;
    }
    case 2: {
      currentBrick = new boxBrick(
        getRandomArbitrary(0, 100),
        15,
        generateColor()
      );
      break;
    }
    case 3: {
      currentBrick = new halfStraight(
        getRandomArbitrary(0, 100),
        22,
        generateColor()
      );
      break;
    }
    case 4: {
      currentBrick = new curlyBrick(
        getRandomArbitrary(0, 100),
        22,
        generateColor()
      );
      break;
    }
  }
  const gameOver = () => {
    clearInterval(interval);
    tetris.style.display = "none";
    startBtn.style.display = "none";
    gameover.style.display = "flex";
  };

  if (currentBrick.isValidMove("down")) {
    currentBrick.print();
    clearInterval(interval);
    interval = setInterval(() => {
      currentBrick.move("down");
      if (!currentBrick.isValidMove("down")) {
        let selectedLevels = levelCheck();
        delLevel(selectedLevels);
        if (selectedLevels.length > 0) UpdateScore(10);
        //!                                                       this is the place to chage some thing 
        let randomColor = colors[getRandomArbitrary(0,colors.length)]
        cells.forEach((cell)=>{
          cell.style.border = "1px solid rgb(255, 142, 142)"
          
          cell.style.boxShadow = `inset 0px 0px 6px ${randomColor}`
        })
        gravity(selectedLevels);
        UpdateScore(5);
        brickCycle();
      }
    }, 1000);
  } else {
    gameOver();
  }
};
