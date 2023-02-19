const UPDATE_INTERVAL = 5;
const GAME_LIMIT = 120;
const API_BASE = "https://nackademin-item-tracker.herokuapp.com/";
let deleteCurrentGame = document.querySelector(".delete-current-game");
let showIdContainer = document.querySelector(".showID");
let deleteForm = document.querySelector(".delete-form");
let deleteInput = document.querySelector(".delete-input");
let gameContainer = document.querySelector(".game-container");
let startGameBtn = document.querySelector(".start");
let joinForm = document.querySelector(".join-form");

let lastRenderTime = 0;
let player1;
let player2;
let gameOver = false;
let gamename;
let gameID;
let player1turn;
/** Game Loop */
function main(currentTime) {
  if (currentTime > GAME_LIMIT * 1000) {
    gameOver = true;
    alert("");
  }
  if (gameOver) deleteGame(gameID);

  const secondsSinceLastRender = currentTime - lastRenderTime;
  if (secondsSinceLastRender > UPDATE_INTERVAL * 1000 || lastRenderTime === 0) {
    console.log(currentTime);
    console.log(`${UPDATE_INTERVAL}s uppdatering`);
    lastRenderTime = currentTime;
    let player = document.querySelector("input[type='radio']:checked");

    console.log(
      "Its Player: " +
        player.value +
        " playing and its player1s turn : " +
        player1turn
    );
    renderBoard(itemList, player1turn);
  }
  window.requestAnimationFrame(main); // Den kör sig själv incursive
}
//window.requestAnimationFrame(main);
/**
 * Helper Functions
 */
function renderBoard(gameBoard, player1turn) {
  gameContainer.innerHTML = "";
  console.log(gameBoard);
  gameBoard.forEach((item, index) => {
    let div = document.createElement("div");
    div.classList.add("square");
    if (item.checked) {
      div.innerHTML = item.checkedByPlayer1 ? "x" : "o";
      div.classList.add("checked");
    } else {
      div.innerHTML = ` ${index}`;
      div.addEventListener("click", (event) => {
        event.preventDefault();
        console.log("klick " + index);
        gameBoard[index].checked = true;
        gameBoard[index].checkedByPlayer1 = player1turn ? "x" : "o";
        player1turn = changeTurn(player1turn);
        // Gör en PUT request för att ändra checked och checkedbyplayer1 för aktuellt item.id

        //.then(renderBoard())
      });
      //   squares[i].addEventListener("click", (event) => {
      //     event.preventDefault();
      //     console.log("Eventlistener  :  " + i);
      //     itemList[0][i].checked = true; // API PUT          changeTurn();
      //     itemList[0][i].checkedByPlayer1 = itemList.player1turn
      //       ? true
      //       : false;
      //     changeTurn(itemList);
      //     renderBoard(itemList);
      //     // API PUT          changeTurn();
      //   });
    }
    gameContainer.appendChild(div);
  });
}
async function changeTurn(gameID, player1turn) {
  let newTurn = player1turn ? false : true;

  await fetch(`${API_BASE}lists/${gameID}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      player1turn: newTurn,
    }),
  });
}
async function player2join(gameID) {
  await fetch(`${API_BASE}lists/${gameID}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      player2: true,
    }),
  });
}
// Create game list function
// start game loop //window.reqAnF

function generateGameObjects(gameID) {
  for (let index = 0; index < 9; index++) {
    postObjectToList(gameID, index);
  }
}
async function postObjectToList(gameID, index) {
  const res = await fetch(`${API_BASE}lists/${gameID}/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      checked: false,
      checkedByPlayer1: false,
      index: `${index}`,
    }),
  });
}
async function deleteGame(gameID) {
  const res = await fetch(
    `https://nackademin-item-tracker.herokuapp.com/lists/${gameID}`,
    {
      method: "DELETE",
    }
  );
}
function randomNumberArray() {
  let random1 = Math.floor(Math.random() * 9) + 1;
  let random2 = Math.floor(Math.random() * 9) + 1;
  let random3 = Math.floor(Math.random() * 9) + 1;
  let random4 = Math.floor(Math.random() * 9) + 1;
  let random5 = Math.floor(Math.random() * 9) + 1;
  let random6 = Math.floor(Math.random() * 9) + 1;
  return `${random1}${random2}${random3}${random4}${random5}${random6}`;
}

async function getGame(gameID) {
  const gameList = await fetch(`${API_BASE}lists/${gameID}`);
  const gameListResult = await gameList.json();
}
/**
 * Eventlisteners
 */
startGameBtn.addEventListener("click", async function (e) {
  e.preventDefault();
  player1 = true;
  gamename = randomNumberArray();
  showIdContainer.innerHTML = `${gamename} <br/> `;
  console.log(gamename);
  const res = await fetch(`${API_BASE}lists`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      listname: gamename,
      player1turn:true,
    }),
  });
  const search = await fetch(`${API_BASE}listsearch?listname=${gamename}`);
  const searchResult = await search.json();
  gameID = searchResult[0]._id;

  deleteCurrentGame.addEventListener("click", (event) => {
    event.preventDefault();
    deleteGame(gameID);
    console.log("delete gameID: " + gameID);
  });

  console.log(gameID + "  gameID");
  generateGameObjects(gameID);
  console.log("Runs generateGameObjects");
  let game = getGame(gameID);
  console.log(game);
  console.log("getGame(id");

  //let gameBoard = game.itemList;
  //console.log(gameBoard);
});

joinForm.addEventListener("submit", (event) => {
  event.preventDefault();
  let joinInput = document.querySelector(".join-input").value;
  console.log(joinInput);
  player2 = true;
});
deleteForm.addEventListener("submit", (event) => {
  event.preventDefault();
  let deleteInput = document.querySelector(".delete-input");
  deleteID = deleteInput.value;
  console.log("deletar  ID: " + deleteID);
  deleteGame(deleteID);
  deleteForm.reset();
});
