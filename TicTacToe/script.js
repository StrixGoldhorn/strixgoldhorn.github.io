/*
Welcome to the source code
The computer logic is a hardcoded. Starting conditions and their respective moves are hardcoded. The game will reach a point where it is just defending (blocking player wins) and attacking (if possible to make a winning move, do it).
The logic is simple. The computer follows hardcoded conditions up to a point. It will then try to win the game, or block a player's win to force a draw.

TODO:
- Computer makes additional move even after winning
*/



let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let prevPlayer = "O";
let computerPlayer = "O";
let gameActive = true;
let computerTurn = 0;
let gameState = "";
let playerMove = -1;
const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
];

let AA = ["", "", "O", "", "X", "", "X", "", ""];
let BA = ["X", "", "", "", "O", "", "", "", "X"];
let CA = ["", "X", "", "X", "O", "", "", "", "",];
let CB1 = ["", "", "X", "X", "O", "", "", "", "",];
let CB2 = ['X', '', '', '', 'O', '', '', 'X', ''];

function verticalFlip(currBoard) {
    let a = [...currBoard];
    [a[0], a[3], a[6], a[2], a[5], a[8]] = [a[2], a[5], a[8], a[0], a[3], a[6]];
    return a;
}

function horizontalFlip(currBoard) {
    let a = [...currBoard];
    [a[0], a[1], a[2], a[6], a[7], a[8]] = [a[6], a[7], a[8], a[0], a[1], a[2]];
    return a;
}

function diagonalFlip(currBoard) {
    let a = [...currBoard].reverse();
    return a;
}

// Function to handle a player's move
function handleMove(index) {
    playerMove = index;
    if (gameActive && board[index] === "") {
        board[index] = currentPlayer;
        drawBoard();
        checkResult();
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        prevPlayer = prevPlayer === "X" ? "O" : "X";

        // Make the computer player's move after a short delay
        setTimeout(makeComputerMove, 1);
    }
}

// Function to draw the board on the page
function drawBoard() {
    const cells = document.querySelectorAll(".cell");
    cells.forEach((cell, index) => {
        cell.innerText = board[index];
    });
}

function checkNearWin(player) {
    const nearWin = [[0, 1], [0, 2], [1, 2], [3, 4], [4, 5], [3, 5], [6, 7], [7, 8], [6, 8], [0, 3], [3, 6], [0, 6], [1, 4], [4, 7], [1, 7], [2, 5], [5, 8], [2, 8], [0, 4], [4, 8], [0, 8], [2, 4], [4, 6], [2, 6]];

    /*
    0 1 2
    3 4 5
    6 7 8
    */

    for (let condition of nearWin) {
        const [a, b] = condition;
        if (board[a] === player && board[a] === board[b]) {

            // Iterate over each winning condition to determine which move to play to win
            for (let winCon of winningConditions) {
                if ([a, b].every(val => winCon.includes(val))) {

                    // Filters out the winning move
                    for (let move of winCon) {
                        if (move != a && move != b && board[move] == "") {
                            return move;
                        }
                    }
                }

            }
        }
    }
    return false;
}



function tryWin() {
    if (checkNearWin(computerPlayer) != "false") {
        board[checkNearWin(computerPlayer)] = computerPlayer;
        checkResult();
    }
}

// Function to check the result of the game
function checkResult() {
    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        if ((board[a] === "X" || board[a] === "O") && board[a] === board[b] && board[a] === board[c]) {
            gameActive = false;
            showMessage(`Player ${board[a]} wins!`);
            return;
        }
    }

    if (!board.includes("")) {
        gameActive = false;
        showMessage("It's a draw!");
        return; 
    }
}

// Function to display a message on the page
function showMessage(message) {
    const messageElement = document.getElementById("message");
    messageElement.innerText = message;
}

// Function to reset the game
function resetGame() {
    board = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = "X";
    prevPlayer = "O";
    gameActive = true;
    computerTurn = 0;
    drawBoard();
    showMessage("");
}

// Function to make a move for the computer player
function makeComputerMove() {
    if (gameActive && currentPlayer === computerPlayer) {
        switch (computerTurn) {
            case 0:
                // First move, try to secure centre. If not, take corner

                // If player takes center
                if (playerMove == 4) {
                    // Take corner
                    board[2] = currentPlayer;
                    gameState = "A";
                }
                else {
                    // Take center
                    board[4] = currentPlayer;

                    // Player takes corner
                    if ([0, 2, 6, 8].includes(playerMove)) {
                        gameState = "B";
                    }

                    // Player takes edge
                    else {
                        gameState = "C";
                    }
                }
                break;

            case 1:
                // Second move, computer cannot win, so check if player winning
                if ((board[checkNearWin(prevPlayer)] == "")) {
                    board[checkNearWin(prevPlayer)] = currentPlayer;
                }

                else if (JSON.stringify(board) == JSON.stringify(AA) || JSON.stringify(verticalFlip(board)) == JSON.stringify(AA) || JSON.stringify(horizontalFlip(board)) == JSON.stringify(AA) || JSON.stringify(diagonalFlip(board)) == JSON.stringify(AA)) {
                    if (board[0] == "") {
                        board[0] = currentPlayer;
                    }
                    else {
                        board[2] = currentPlayer;
                    }
                }
                else if (JSON.stringify(board) == JSON.stringify(BA) || JSON.stringify(verticalFlip(board)) == JSON.stringify(BA) || JSON.stringify(horizontalFlip(board)) == JSON.stringify(BA) || JSON.stringify(diagonalFlip(board)) == JSON.stringify(BA)) {
                    board[1] = currentPlayer;
                }

                else {
                    // CA
                    if (JSON.stringify(board) == JSON.stringify(CA)){
                        board[0] = currentPlayer;
                    }
                    else if(JSON.stringify(verticalFlip(board)) == JSON.stringify(CA)){
                        board[2] = currentPlayer;
                    }
                    else if(JSON.stringify(horizontalFlip(board)) == JSON.stringify(CA)){
                        board[6] = currentPlayer;
                    }
                    else if(JSON.stringify(diagonalFlip(board)) == JSON.stringify(CA)){
                        board[8] = currentPlayer;
                    }

                    // CB
                    else if (JSON.stringify(board) == JSON.stringify(CB1) || JSON.stringify(verticalFlip(board)) == JSON.stringify(CB1)){
                        board[7] = currentPlayer;
                    }
                    else if(JSON.stringify(horizontalFlip(board)) == JSON.stringify(CB1) || JSON.stringify(diagonalFlip(board)) == JSON.stringify(CB1)){
                        board[1] = currentPlayer;
                    }
                    else if (JSON.stringify(board) == JSON.stringify(CB2) || JSON.stringify(verticalFlip(board)) == JSON.stringify(CB2)){
                        board[3] = currentPlayer;
                    }
                    else if(JSON.stringify(horizontalFlip(board)) == JSON.stringify(CB2) || JSON.stringify(diagonalFlip(board)) == JSON.stringify(CB2)){
                        board[5] = currentPlayer;
                    }

                    // CC
                    else if (JSON.stringify(board) == JSON.stringify(['', 'X', '', '', 'O', '', '', 'X', ''])){
                        board[0] = currentPlayer;
                    }
                    else if (JSON.stringify(board) == JSON.stringify(['', '', '', 'X', 'O', 'X', '', '', ''])){
                        board[0] = currentPlayer;
                    }

                    // CD
                    else{
                        board[checkNearWin(prevPlayer)] = currentPlayer;
                    }
                }

                break;

            default:
                tryWin();
                // blockMove();
                if ((board[checkNearWin(prevPlayer)] == "")) {
                    board[checkNearWin(prevPlayer)] = currentPlayer;
                }
                else{
                    board[board.indexOf("")] = currentPlayer;
                }
                break;
        }
        drawBoard();
        checkResult();
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        prevPlayer = prevPlayer === "X" ? "O" : "X";
        computerTurn += 1;
    }
}

// Function to handle the selection of the computer player's symbol
function handleSymbolSelection(symbol) {
    if (symbol === "X") {
        currentPlayer = "X";
        computerPlayer = "O";
    } else {
        currentPlayer = "O";
        computerPlayer = "X";
    }

    resetGame();
}

function stateA(playerMove) {

}

function stateB(playerMove) {

}

function stateC(playerMove) {

}

// Draw the initial board on page load
drawBoard();
