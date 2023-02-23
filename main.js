const UPDATE_INTERVAL = 2;
const GAME_LIMIT = 50;
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
let game;
let lastRenderTime = 0;
let player1 = null;
let player2 = null;
let gameOver = false;
let gameName;
let gameID;
let player1turn;

async function gameLoop(gameID) {
  let game = await fetchGame(gameID);
  console.log(game);
  let board = game.board;
  let player1turn = game.player1turn;
  console.log(player1turn);
  if (!gameOver && iterations < 2) {
    setTimeout(() => {
      console.log("Kör sig själv igen");
      iterations++;
      gameLoop(gameID);
    }, 2000);
  } else { 
    console.log("game over!   iterations: " + iterations);
    deleteGame(gameID)
  }
}
// ---- Färdiga
async function fetchGame(gameID) {
  console.log("nu körs fetch");
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
      },
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
  gameName = randomNumberStr();
  let gameID = await createGame(gameName);
  showIdContainer.innerHTML = `${gameName} (copied to clipboard)`;
  copyToClipboard(gameName);
  console.log(gameID);
  gameLoop(gameID);
  initial.classList.add("hidden");
  p1div.classList.add("green-border")
});
//! ---

//!  -------
// let array = [0, 1, 2, 3, 4, 5, 7, 8]

// array.forEach((item,index) => console.log(item + " " + index));
