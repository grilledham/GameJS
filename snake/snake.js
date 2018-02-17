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
let score;
let scoreText;
let snake;
let apple;
let dir;
let isRunning = false;

let lastKey = "";



document.addEventListener("DOMContentLoaded", function (event) {
    canvas = document.getElementById("canvas");
    scoreText = document.getElementById("score");

    blockWidth = canvas.width / xBlocks;
    blockHeight = canvas.height / yBlocks;
    ctx = canvas.getContext("2d");

    document.addEventListener('keypress', (event) => {
        let keyName = event.key;
        keyName = keyName.toLowerCase();
        lastKey = keyName;
        //doInput(keyName);
    });

    startGame();
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

    score = 0;
    scoreText.innerHTML = "Score: " + score;

    isRunning = true;
}

function isPointInSnake(x, y) {
    for (let index = 0; index < snake.length; index++) {
        const element = snake[index];
        if (x == element.x && y == element.y)
            return true;
    }
    return false;
}

function gameOver() {
    isRunning = false;
    scoreText.innerHTML = "Final Score: " + score;
}


function update() {
    doInput();

    if (!isRunning)
        return;


    doSnake();

    render();
}

function doInput() {
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
    let last = snake.pop();
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

    if (isPointInSnake(newHead.x, newHead.y)) {
        gameOver();
        return;
    }

    snake.splice(0, 0, newHead);

    if (apple.x == newHead.x && apple.y == newHead.y) {
        spawnApple();
        snake.push(last);
        score++;
        scoreText.innerHTML = "Score: " + score;
    }
}

function spawnApple() {
    let x;
    let y;

    do {
        x = randomInt(xBlocks);
        y = randomInt(yBlocks);
    } while (isPointInSnake(x, y));

    apple = new Point(x, y);
}

function render() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "black";

    for (let index = 0; index < snake.length; index++) {
        let point = snake[index];
        ctx.fillRect(point.x * blockWidth, point.y * blockWidth, blockWidth, blockHeight);

        if (index == 0) {
            ctx.fillStyle = "red";
            let x = dir.x == 0 ? 0.25 : 0;
            let y = dir.y == 0 ? 0.25 : 0;
            ctx.fillRect(point.x * blockWidth + (0.5 - x / 2) * blockWidth + x * blockWidth, point.y * blockHeight + (0.5 - y / 2) * blockHeight + y * blockHeight, 0.25 * blockWidth, 0.25 * blockHeight);
            ctx.fillRect(point.x * blockWidth + (0.5 - x / 2) * blockWidth - x * blockWidth, point.y * blockHeight + (0.5 - y / 2) * blockHeight - y * blockHeight, 0.25 * blockWidth, 0.25 * blockHeight);
            ctx.fillStyle = "black";
        }
    }

    ctx.beginPath();
    ctx.ellipse(apple.x * blockWidth + blockWidth / 2, apple.y * blockHeight + blockHeight / 2, blockWidth / 2, blockHeight / 2, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'green';
    ctx.fill();
}