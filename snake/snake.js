/// <reference path="../typings/globals/jquery/index.d.ts" />

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
let scoreText;
let speedText;
let canvasWidth;
let canvasHeight;
let columns;
let rows;
let resetButton;
let toggleDebugButton;

let ctx;
let blockWidth;
let blockHeight;
let score;
let snake;
let apple;
let currentDir;
let newDir;
let speed;
let isRunning = false;
let isPaused = false;

let canvasWidthMin;
let canvasWidthMax;
let canvasHeightMin;
let canvasHeightMax;
let columnsMin;
let columnsMax;
let rowsMin;
let rowsMax;

let lastKey = "";
let ticksNeededForMove;
let tickUtillMove;

document.addEventListener("DOMContentLoaded", function (event) {
    canvas = document.getElementById("canvas");
    scoreText = document.getElementById("score");
    speedText = document.getElementById("speed");
    canvasWidth = document.getElementById("canvasWidth");
    canvasHeight = document.getElementById("canvasHeight");
    columns = document.getElementById("columns");
    rows = document.getElementById("rows");
    resetButton = document.getElementById("resetButton");
    toggleDebugButton = $("#toggleDebugButton");

    canvasWidth.value = canvas.width;
    canvasHeight.value = canvas.height;
    canvasWidthMin = parseInt(canvasWidth.min);
    canvasWidthMax = parseInt(canvasWidth.max);
    canvasHeightMin = parseInt(canvasHeight.min);
    canvasHeightMax = parseInt(canvasHeight.max);
    columnsMin = parseInt(columns.min);
    columnsMax = parseInt(columns.max);
    rowsMin = parseInt(rows.min);
    rowsMax = parseInt(rows.max);

    document.addEventListener("keydown", event => {
        let keyName = event.key;
        keyName = keyName.toLowerCase();
        lastKey = keyName;
        //doInput(keyName);
    });

    resetButton.onclick = startGame;

    toggleDebugButton.click(event => {
        $("#speed").toggle();
    });

    startGame();
    setInterval(update, 1000 / 60);
});

function randomInt(max) {
    return Math.floor(Math.random() * max);
}

function clamp(number, min, max) {
    if (number < min) return min;
    if (number > max) return max;

    return number;
}

function doSpeed() {
    //let s = 0.5 * Math.log(speed) + 2
    let s = 2 * Math.sqrt(speed);
    ticksNeededForMove = 60 / s;
    ticksNeededForMove = clamp(ticksNeededForMove, 2, 60);

    speedText.innerHTML =
        "speed: " +
        speed +
        ", tiles per second: " +
        parseFloat(60 / ticksNeededForMove).toFixed(2);
}

function startGame() {
    let cw = parseInt(canvasWidth.value);
    if (isNaN(cw)) cw = canvas.width;
    cw = clamp(cw, canvasWidthMin, canvasWidthMax);

    let ch = parseInt(canvasHeight.value);
    if (isNaN(ch)) ch = canvas.height;
    ch = clamp(ch, canvasHeightMin, canvasHeightMax);

    canvas.width = cw;
    canvas.height = ch;
    canvasWidth.value = cw;
    canvasHeight.value = ch;

    let c = parseInt(columns.value)
    if (isNaN(c)) c = xBlocks;
    let r = parseInt(rows.value);
    if (isNaN(r)) r = yBlocks;

    c = clamp(c, columnsMin, columnsMax);
    r = clamp(r, rowsMin, rowsMax);
    xBlocks = c;
    yBlocks = r;
    columns.value = c;
    rows.value = r;

    blockWidth = canvas.width / xBlocks;
    blockHeight = canvas.height / yBlocks;
    ctx = canvas.getContext("2d");

    let start = new Point(Math.floor(xBlocks / 2), Math.floor(yBlocks / 2));
    snake = [start, new Point(start.x - 1, start.y)];

    newDir = null;
    currentDir = new Point(1, 0);
    speed = 1;
    doSpeed();
    tickUtillMove = ticksNeededForMove;

    spawnApple();

    score = 0;
    scoreText.innerHTML = "Score: " + score;

    isRunning = true;
    isPaused = false;
}

function isPointInSnake(x, y) {
    for (let index = 0; index < snake.length; index++) {
        const element = snake[index];
        if (x == element.x && y == element.y) return true;
    }
    return false;
}

function gameOver() {
    isRunning = false;
    scoreText.innerHTML = "Final Score: " + score;
}

function update() {
    doInput();
    doSnake();
    render();
}

function doInput() {
    if (lastKey == "") return;

    let keyName = lastKey;
    lastKey = "";

    switch (keyName) {
        case "r":
            startGame();
            break;
        case "p":
            isPaused = !isPaused;
            break;
        case "w":
        case "arrowup":
            if (currentDir.y == 1) return;
            newDir = new Point(0, -1);
            break;
        case "s":
        case "arrowdown":
            if (currentDir.y == -1) return;
            newDir = new Point(0, 1);
            break;
        case "a":
        case "arrowleft":
            if (currentDir.x == 1) return;
            newDir = new Point(-1, 0);
            break;
        case "d":
        case "arrowright":
            if (currentDir.x == -1) return;
            newDir = new Point(1, 0);
            break;
        default:
            break;
    }
}

function doSnake() {
    if (!isRunning || isPaused) return;

    tickUtillMove--;
    if (tickUtillMove <= 0) tickUtillMove += ticksNeededForMove;
    else return;

    if (newDir) {
        currentDir = newDir;
        newDir = null;
    }

    let head = snake[0];
    let last = snake.pop();
    let newHead = new Point(head.x, head.y);

    newHead.x += currentDir.x;
    newHead.y += currentDir.y;

    if (newHead.x == xBlocks) newHead.x = 0;
    else if (newHead.x < 0) newHead.x = xBlocks - 1;

    if (newHead.y == yBlocks) newHead.y = 0;
    else if (newHead.y < 0) newHead.y = yBlocks - 1;

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

        speed++;
        doSpeed();
    }
}

function spawnApple() {
    // Don't try to spawn apple if there is no room to do so.
    if (snake.length >= xBlocks * yBlocks) return;

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
    
    let lightness = 0;
    let inc = 128 / snake.length;

    for (let index = 0; index < snake.length; index++) {
        let l = Math.floor(lightness);
        let color = 'rgb(' + l + ',' + l + ',' + l + ')';
        ctx.fillStyle = color;
        lightness += inc;        
        let point = snake[index];
        ctx.fillRect(
            point.x * blockWidth,
            point.y * blockHeight,
            blockWidth,
            blockHeight
        );

        if (index == 0) {
            ctx.fillStyle = "red";
            let x = currentDir.x == 0 ? 0.25 : 0;
            let y = currentDir.y == 0 ? 0.25 : 0;
            ctx.fillRect(
                point.x * blockWidth + (0.5 - x / 2) * blockWidth + x * blockWidth,
                point.y * blockHeight + (0.5 - y / 2) * blockHeight + y * blockHeight,
                0.25 * blockWidth,
                0.25 * blockHeight
            );
            ctx.fillRect(
                point.x * blockWidth + (0.5 - x / 2) * blockWidth - x * blockWidth,
                point.y * blockHeight + (0.5 - y / 2) * blockHeight - y * blockHeight,
                0.25 * blockWidth,
                0.25 * blockHeight
            );

        }
    }

    ctx.beginPath();
    ctx.ellipse(
        apple.x * blockWidth + blockWidth / 2,
        apple.y * blockHeight + blockHeight / 2,
        blockWidth / 2,
        blockHeight / 2,
        0,
        2 * Math.PI,
        false
    );
    ctx.fillStyle = "green";
    ctx.fill();

    if (!isRunning) {
        ctx.fillStyle = "grey";
        ctx.font = "30px Verdana";
        let txt = "Game Over";
        ctx.fillText(
            txt,
            canvas.width / 2 - ctx.measureText(txt).width / 2,
            canvas.height / 2
        );
        ctx.font = "20px Verdana";
        txt = scoreText.innerHTML;
        ctx.fillText(
            txt,
            canvas.width / 2 - ctx.measureText(txt).width / 2,
            canvas.height / 2 + 30
        );
        txt = "press 'R' to restart";
        ctx.fillText(
            txt,
            canvas.width / 2 - ctx.measureText(txt).width / 2,
            canvas.height / 2 + 60
        );
    } else if (isPaused) {
        ctx.fillStyle = "grey";
        ctx.font = "30px Verdana";
        let txt = "Paused";
        ctx.fillText(
            txt,
            canvas.width / 2 - ctx.measureText(txt).width / 2,
            canvas.height / 2
        );
        ctx.font = "20px Verdana";
        txt = "press 'P' to unpause";
        ctx.fillText(
            txt,
            canvas.width / 2 - ctx.measureText(txt).width / 2,
            canvas.height / 2 + 30
        );
    }
}
