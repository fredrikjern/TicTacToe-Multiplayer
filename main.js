const UPDATE_INTERVAL = 1000;
const GAME_LIMIT = 12;
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
let p2div = document.querySelector(".p2");
let signals = document.querySelectorAll(".signal");

let game;
let lastRenderTime = 0;
let player1 = null;
let gameOver = false;
let gameName;
let gameID;
let player1turn;
let board = [];
const correctArrays = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

async function gameLoop(gameID) {
  let game = await fetchGame(gameID);
  board = game.board;
  gameOver = checkWinner(board, correctArrays);

  if (!gameOver && iterations < GAME_LIMIT) {
    setTimeout(() => {
      gameLoop(gameID);
    }, UPDATE_INTERVAL);
  } else {
    console.log("game over!   iterations: " + iterations);
    setTimeout(() => {
      deleteGame(gameID);
    }, 3000);
    renderBoard(board);
  }

  renderBoard(board);

  if (game.player2joined) p2div.classList.remove("play2not");
  if (game.player1turn) {
    signals[0].classList.add("active");
    signals[1].classList.remove("active");
  } else if (!game.player1turn) {
    signals[1].classList.add("active");
    signals[0].classList.remove("active");
  }
  boardEventListeners(board, game.player1turn, player1, gameID);
}
// ---- Färdiga
//
function checkWinner(board, correctArrays) {
  let winner = null;
  let winningArray = [];
  let p1 = [];
  let p2 = [];
  board.forEach((item, index) => {
    if (item === 1) p1.push(index);
    if (item === 2) p2.push(index);
  });
  [winner, winningArray] = compareArrays(p1, p2, correctArrays);
  console.log(winner + " " + winningArray);
  return winner > 0 ? true : false;
}
function compareArrays(arr1, arr2, correctArrays) {
  let result = null;
  let winner = 0;

  correctArrays.forEach((correctArray) => {
    const arr1Matches = correctArray.every((val) => arr1.includes(val));
    const arr2Matches = correctArray.every((val) => arr2.includes(val));

    if (arr1Matches) {
      result = correctArray;
      winner = 1;
      showIdContainer.innerHTML = "Player 1 Wins !";
      return [winner, result];
    } else if (arr2Matches) {
      result = correctArray;
      winner = 2;
      showIdContainer.innerHTML = "Player 2 Wins !";
      return [winner, result];
    }
  });

  return [winner, result];
}
async function player2join(gameID) {
  await fetch(`${API_BASE}lists/${gameID}`, {
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
    if (squareresults === 1)
      square.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path class="x" d="M376.6 84.5c11.3-13.6 9.5-33.8-4.1-45.1s-33.8-9.5-45.1 4.1L192 206 56.6 43.5C45.3 29.9 25.1 28.1 11.5 39.4S-3.9 70.9 7.4 84.5L150.3 256 7.4 427.5c-11.3 13.6-9.5 33.8 4.1 45.1s33.8 9.5 45.1-4.1L192 306 327.4 468.5c11.3 13.6 31.5 15.4 45.1 4.1s15.4-31.5 4.1-45.1L233.7 256 376.6 84.5z"/></svg>';
    if (squareresults === 2)
      square.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path class="circle" d="M512 256C512 397.4 397.4 512 256 512C114.6 512 0 397.4 0 256C0 114.6 114.6 0 256 0C397.4 0 512 114.6 512 256zM256 48C141.1 48 48 141.1 48 256C48 370.9 141.1 464 256 464C370.9 464 464 370.9 464 256C464 141.1 370.9 48 256 48z"/></svg>';
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
    let g = await data[0]._id;
    console.log(g);
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
});
joinForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  //player1 = true;
  player1 = false;
  let joinInput = document.querySelector(".join-input").value;

  showIdContainer.innerHTML = `${joinInput} (copied to clipboard)`;
  initial.classList.add("hidden");
  gameID = await findGameID(joinInput);
  let resp = await player2join(gameID);
  console.log(resp);
  gameLoop(gameID);
});
//! ---

//!  -------
// let array = [0, 1, 2, 3, 4, 5, 7, 8]

// array.forEach((item,index) => console.log(item + " " + index));
