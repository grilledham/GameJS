let xBlocks = 10;
let yBlocks = 10;

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    toString() {
        return this.x + "," + this.y;
    }
}

let canvas;
let ctx;
let blockWidth;
let blockHeight;
let snake;
let apple;
let dir;

let lastKey = "";



document.addEventListener("DOMContentLoaded", function (event) {
    canvas = document.getElementById("canvas");
    blockWidth = canvas.width / xBlocks;
    blockHeight = canvas.height / yBlocks;
    ctx = canvas.getContext("2d");

    startGame();

    document.addEventListener('keypress', (event) => {
        let keyName = event.key;
        keyName = keyName.toLowerCase();
        lastKey = keyName;
        //doInput(keyName);
    });

    setInterval(update, 1000 / 10)
});

function randomInt(max) {
    return Math.floor(Math.random() * max);
}

function startGame() {
    let start = new Point(Math.floor(xBlocks / 2), Math.floor(yBlocks / 2));
    snake = [new Point(5, 5), new Point(4, 5), new Point(3, 5)];

    dir = new Point(1, 0);

    spawnApple();
}


function update() {
    doInput();
    doSnake();

    render();
}

function doInput() {
    console.log(lastKey);
    if (lastKey == "")
        return;

    let keyName = lastKey;
    lastKey = "";

    switch (keyName) {
        case "r":
            startGame();
            break;
        case "w":
            if (dir.y == 1)
                return;
            dir = new Point(0, -1);
            break;
        case "s":
            if (dir.y == -1)
                return;
            dir = new Point(0, 1);
            break;
        case "a":
            if (dir.x == 1)
                return;
            dir = new Point(-1, 0);
            break;
        case "d":
            if (dir.x == -1)
                return;
            dir = new Point(1, 0);
            break;
        default:
            break;
    }
}

function doSnake() {
    let head = snake[0];
    let last = snake[snake.length - 1];
    let newHead = new Point(head.x, head.y);

    newHead.x += dir.x;
    newHead.y += dir.y;

    if (newHead.x == xBlocks)
        newHead.x = 0;
    else if (newHead.x < 0)
        newHead.x = xBlocks - 1;

    if (newHead.y == yBlocks)
        newHead.y = 0;
    else if (newHead.y < 0)
        newHead.y = yBlocks - 1;

    snake.splice(0, 0, newHead);

    if (apple.x == newHead.x && apple.y == newHead.y) {
        spawnApple();
    } else if (snake.length > 0) {
        snake.pop();
    }
}

function spawnApple() {
    let x;
    let y;
    let doAgain = false;
    
    do {
        x = randomInt(xBlocks);
        y = randomInt(yBlocks);
        for (let index = 0; index < snake.length; index++) {
            let point = snake[index];
            if (x == point.x && y == point.y) {
                doAgain = true;
                break;
            }
        }

    } while (doAgain);

    apple = new Point(x, y);
}

function render() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "black";

    for (let index = 0; index < snake.length; index++) {
        let point = snake[index];
        ctx.fillRect(point.x * blockWidth, point.y * blockWidth, blockWidth, blockHeight);
    }

    ctx.beginPath();
    ctx.arc(apple.x * blockWidth + blockWidth / 2, apple.y * blockHeight + blockHeight / 2, blockHeight / 2, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'green';
    ctx.fill();



    /*  ctx.fillStyle = "green";
     ctx.fillRect(apple.x * blockWidth, apple.y * blockHeight, blockWidth, blockHeight);   */


}