const UPDATE_INTERVAL = 2;
const GAME_LIMIT = 50;
const API_BASE = "https://nackademin-item-tracker.herokuapp.com/";

let deleteCurrentGame = document.querySelector(".delete-current-game");
let gameOverBtn = document.querySelector(".game-over-button");
let showIdContainer = document.querySelector(".showID");
let deleteForm = document.querySelector(".delete-form");
let deleteInput = document.querySelector(".delete-input");
let gameContainer = document.querySelector(".game-container");
let startGameBtn = document.querySelector(".start");
let joinForm = document.querySelector(".join-form");
let game;
let lastRenderTime = 0;
let player1;
let player2;
let gameOver = false;
let gameName;
let gameID;
let player1turn;


function (params) {
  
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
  showIdContainer.innerHTML = `${gameName} (copied to clipboard)`;
  copyToClipboard(gameName)

});

let array = [0, 1, 2, 3, 4, 5, 7, 8]

array.forEach((item,index) => console.log(item + " " + index));