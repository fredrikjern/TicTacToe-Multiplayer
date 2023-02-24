const UPDATE_INTERVAL = 1000;
const GAME_LIMIT = 20;
const API_BASE = "https://nackademin-item-tracker.herokuapp.com/";
let iterations = 0;
let deleteCurrentGame = document.querySelector(".delete-current-game");
let gameOverBtn = document.querySelector(".game-over-button");
let showIdContainer = document.querySelector(".showID");
let deleteForm = document.querySelector(".delete-form");
let deleteInput = document.querySelector(".delete-input");
let gameContainer = document.querySelector(".game-container");
let startGameBtn = document.querySelector(".start");
let joinForm = document.querySelector(".join-form");
let initial = document.querySelector(".initial");
let p1div = document.querySelector(".p1");
let p2div = document.querySelector(".p2")
let game;
let lastRenderTime = 0;
let player1 = null;
let gameOver = false;
let gameName;
let gameID;
let player1turn;
let board = [];
let correctArrays = [[0, 1, 2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6]];
function checkWinner(board,correctArrays) {
  let p1 = [];
  let p2 = [];
  board.forEach((item, index) => {
    if (item === 1) p1.push(index);
    if (item === 2) p2.push(index);
  });

}
async function gameLoop(gameID) {
  let game = await fetchGame(gameID);
  board = game.board;
  if (game.player2join) {
    p2.classList.remove("play2not")
    
  }
  let player1turn = game.player1turn;
  checkWinner(board);
  renderBoard(board);
  if (game.player2joined)
    boardEventListeners(board, player1turn, player1, gameID);

  if (!gameOver && iterations < GAME_LIMIT) {
    setTimeout(() => {
      console.log("Kör sig själv igen");
      iterations++;
      gameLoop(gameID);
    }, UPDATE_INTERVAL);
  } else {
    console.log("game over!   iterations: " + iterations);
    deleteGame(gameID);
    renderBoard(board);
  }
}
// ---- Färdiga
//
async function player2join(gameID) {
  return fetch(`${API_BASE}lists/${gameID}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      player1turn: true,
      player2joined: true,
    }),
  });
}
//
async function checkSquare(board, player1turn, gameID) {
  try {
    let turn = player1turn ? false : true;
    let res = await fetch(`${API_BASE}lists/${gameID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        board: board,
        player1turn: turn,
      }),
    });
    let data = await res.json();
    return data;
  } catch (error) {
    console.log(error);
  }
}
//
function boardEventListeners(board, player1turn, player1, gameID) {
  let squares = document.querySelectorAll(".square");

  squares.forEach((square, index) => {
    // console.log(player1);
    // console.log(player1turn);
    if (player1 && player1turn && board[index] === 0) {
      console.log("kör denna");
      square.addEventListener("click", async (event) => {
        event.preventDefault();
        square.innerHTML = "X";
        board[index] = 1;
        console.log(board);
        console.log("klick: " + index);
        renderBoard(board);
        checkSquare(board, player1turn, gameID);
        //
      });
    }
    if (!player1 && !player1turn && board[index] === 0) {
      square.addEventListener("click", (event) => {
        console.log("player 2 fick eventlisteners");
        event.preventDefault();
        square.innerHTML = "O";
        board[index] = 2;
        console.log(board);
        renderBoard(board);
        checkSquare(board, player1turn, gameID);
        console.log("klick: " + index);
      });
    }
  });
}
/**
 * This functions creates the div's that become the squares and marks them with X/O
 * @param {* An array []} board
 */
function renderBoard(board) {
  console.log(board);
  gameContainer.innerHTML = "";
  board.forEach((squareresults, index) => {
    let square = document.createElement("div");
    //square.innerHTML=`${squareresults}`
    square.classList.add("square");
    if (squareresults === 1) square.innerHTML = "X";
    if (squareresults === 2) square.innerHTML = "O";
    gameContainer.appendChild(square);
  });
}
async function fetchGame(gameID) {
  try {
    const response = await fetch(`${API_BASE}lists/${gameID}`);
    const data = await response.json();

    return data;
  } catch (error) {
    console.log(error);
  }
}
async function createGame(gameName) {
  try {
    const res = await fetch(`${API_BASE}lists`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      }, //* Ändra player1turn till false, ändras när p2 joinar
      body: JSON.stringify({
        listname: gameName,
        board: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        player1turn: false,
        player2joined: false,
      }),
    });
    const data = await res.json();
    let game_ID = data.list._id;
    return game_ID;
  } catch (error) {
    console.log(error);
  }
}
async function deleteGame(gameID) {
  try {
    const res = await fetch(`${API_BASE}lists/${gameID}`, {
      method: "DELETE",
    });
    return console.log("Game deleted: " + gameID);
  } catch (error) {
    console.log(error);
  }
}
async function findGameID(gameName) {
  try {
    let res = await fetch(`${API_BASE}listsearch?listname=${gameName}`);
    let data = await res.json();
    let g = data[0]._id;
    return g;
  } catch (error) {
    console.log(error);
  }
}
function copyToClipboard(copyText) {
  navigator.clipboard
    .writeText(copyText)
    .then(() => {
      console.log("Text copied to clipboard");
    })
    .catch((error) => {
      console.error("Error copying text: ", error);
    });
}
function randomNumberStr() {
  let random1 = Math.floor(Math.random() * 9) + 1;
  let random2 = Math.floor(Math.random() * 9) + 1;
  let random3 = Math.floor(Math.random() * 9) + 1;
  let random4 = Math.floor(Math.random() * 9) + 1;
  let random5 = Math.floor(Math.random() * 9) + 1;
  let random6 = Math.floor(Math.random() * 9) + 1;
  return `${random1}${random2}${random3}${random4}${random5}${random6}`;
}
//! Eventlisteners
startGameBtn.addEventListener("click", async function (e) {
  e.preventDefault();
  player1 = true;
  gameName = randomNumberStr();
  let gameID = await createGame(gameName);
  showIdContainer.innerHTML = `${gameName} (copied to clipboard)`;
  copyToClipboard(gameName);
  gameLoop(gameID);
  initial.classList.add("hidden");
  p1div.classList.add("green-border");
});
joinForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  player1 = true;
  player1 = false;
  let joinInput = document.querySelector(".join-input").value;
  console.log("Joining game: " + joinInput);
  showIdContainer.innerHTML = `${joinInput} (copied to clipboard)`;
  initial.classList.add("hidden");
  p1div.classList.add("green-border");
  gameID = await findGameID(joinInput);
  await player2join(gameID);
  gameLoop(gameID);
  console.log(gameID);
});
//! ---

//!  -------
// let array = [0, 1, 2, 3, 4, 5, 7, 8]

// array.forEach((item,index) => console.log(item + " " + index));
