const UPDATE_INTERVAL = 700;
const GAME_LIMIT = 100;
const API_BASE = "https://nackademin-item-tracker.herokuapp.com/";

let gameContainer = document.querySelector(".game-container");
let showIdContainer = document.querySelector(".showID");
let startGameBtn = document.querySelector(".start");
let joinForm = document.querySelector(".join-form");
let signals = document.querySelectorAll(".signal");
let initial = document.querySelector(".initial");
let restart = document.querySelector(".restart");
let p1div = document.querySelector(".p1");
let p2div = document.querySelector(".p2");

const correctArrays = [
  [0, 1, 2], //Horisontella
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6], // Vertikala
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8], //Diagonaler
  [2, 4, 6],
];
let gameID;
let gameOver = false;
let player1 = null;
let iterations = 0;
let board = [];
let firstRender = true;
let oldTurn;
let oldGameNumber = 0;
/** gameLoop()
 * Incursive function, if gameOver = false it sets a timeout to call itself UPDATE_INTERVAL ms later
 * then executes all the game logic and visual changes.
 * @param {* String , the database ID} gameID
 */
async function gameLoop(gameID) {
  // Gets the current game data (board, player1turn, player2joined)
  let game = await fetchGame(gameID);
  // If the turn has changed since last update a new render is required.
  if (!oldTurn === game.player1turn) firstRender = true;
  // This is probably not necessary, can't decided if its more or less readable?
  board = game.board;
  gameOver = checkWinner(game.board, correctArrays); // Returns true if someones won.
  // IF no one has won and the iteration limit is not reached
  if (!gameOver && iterations < GAME_LIMIT) {
    if (firstRender) {
      renderBoard(board);
      boardEventListeners(board, game.player1turn, player1, gameID);
      firstRender = false;
    }
    setTimeout(() => {
      gameLoop(gameID);
    }, UPDATE_INTERVAL);
  } else if (gameOver) {
    console.log("game over! iterations: " + iterations);
    if (player1) {
      setTimeout(() => {
        checkForRestart(gameID,oldGameNumber);
      }, 2000)
    } else if (!player1) restart.classList.remove("hidden");
    renderBoard(board); // Re-draws the board to "remove" eventListeners.
  }

  if (game.player2joined) p2div.classList.remove("play2not");
  switchSignals(game.player1turn);

  iterations++;
  oldTurn = game.player1turn;
  oldGameNumber = game.gameNumber;

}
//** Work in progress */
// ! ----  Functions --------
async function checkForRestart(gameID, oldGameNumber) {
  console.log("väntar på restart");
  let game = await fetchGame(gameID);
  if (game.gameNumber === oldGameNumber) {
    setTimeout(() => {
      console.log("timeout");
      checkForRestart(gameID,oldGameNumber);
    }, 500);
  } else if (game.gameNumber > oldGameNumber) { 
    console.log("större");
    showIdContainer.innerHTML="Winner winner chicken dinner"
    gameOver = false;
    gameLoop(gameID)
  }
}
async function restartGame(gameNumber, gameID) {
  gameOver = false;
  iterations = 0;
  gameNumber++;
  showIdContainer.innerHTML="Winner winner chicken dinner"
  try {
    await fetch(`${API_BASE}lists/${gameID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        board: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        player1turn: false,
        gameNumber: gameNumber,
      }),
    });
    await gameLoop(gameID);
  } catch (error) {
    console.log(error);
  }
}
function switchSignals(player1turn) {
  if (player1turn) {
    if (!signals[0].classList.contains("active"))
      signals[0].classList.add("active");
    if (signals[1].classList.contains("active"))
      signals[1].classList.remove("active");
  } else if (!player1turn) {
    if (!signals[1].classList.contains("active"))
      signals[1].classList.add("active");
    if (signals[0].classList.contains("active"))
      signals[0].classList.remove("active");
  }
}
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
      showIdContainer.innerHTML = "Player 1 wins!";
      return [winner, result];
    } else if (arr2Matches) {
      result = correctArray;
      winner = 2;
      showIdContainer.innerHTML = "Player 2 wins!";
      return [winner, result];
    } else if (arr1.length + arr2.length > 8 && !arr1Matches && !arr2Matches) {
      winner = 3;
      showIdContainer.innerHTML = "It's a draw!";
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
/** checkSquare
 *  checkSquare sends the updated board
 * @param {* Array - Current gameboard} board
 * @param {* Boolean - Who just played} player1turn
 * @param {* String - databaseID} gameID
 * @returns
 */
async function checkSquare(board, player1turn, gameID) {
  try {
    let turn = player1turn ? false : true; // Changes the turn and sends it to the API
    await fetch(`${API_BASE}lists/${gameID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        board: board,
        player1turn: turn,
      }),
    });
  } catch (error) {
    console.log(error);
  }
}
function boardEventListeners(board, player1turn, player1, gameID) {
  let squares = document.querySelectorAll(".square");
  squares.forEach((square, index) => {
    if (player1 && player1turn && board[index] === 0) {
      // OM Du är spelare 1 OCH det är spelare 1s tur OCH ingen har checkat den rutan --> Lägg till eventlistener
      square.addEventListener("click", async (event) => {
        event.preventDefault();
        board[index] = 1; // Uppdatera boarden i rutan som klickas på till 1 (player1) (muterar)
        renderBoard(board); // Renderar om för att få bort alla eventlisteners, så man inte kan dubbelklicka
        checkSquare(board, player1turn, gameID); // Skickar en PUT med den muterade boarden, och byter vems tur det är
        firstRender = true;
      });
    }
    if (!player1 && !player1turn && board[index] === 0) {
      square.addEventListener("click", (event) => {
        event.preventDefault();
        board[index] = 2;
        renderBoard(board);
        checkSquare(board, player1turn, gameID); // Skickar en PUT med den muterade boarden, och byter vems tur det är
        firstRender = true;
      });
    }
  });
}
/** renderBoard()
 * This functions creates the div's that become the squares and sets innerHTML to an SVG with X or O
 * @param {* An array [0,0,0,0,0,0,0,0,0]} board
 */
function renderBoard(board) {
  gameContainer.innerHTML = "";
  board.forEach((squareresults) => {
    let square = document.createElement("div");
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
        gameNumber: 1,
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
  // Should be a 1 line return... but it works
  let random1 = Math.floor(Math.random() * 9) + 1;
  let random2 = Math.floor(Math.random() * 9) + 1;
  let random3 = Math.floor(Math.random() * 9) + 1;
  let random4 = Math.floor(Math.random() * 9) + 1;
  let random5 = Math.floor(Math.random() * 9) + 1;
  let random6 = Math.floor(Math.random() * 9) + 1;
  return `${random1}${random2}${random3}${random4}${random5}${random6}`;
}
//! Eventlistener
let startClick = false; // preventing double clicks
startGameBtn.addEventListener("click", async function (e) {
  e.preventDefault();
  if (!startClick) {
    startClick = true;
    player1 = true; // The player starting the game becomes player 1
    let gameName = randomNumberStr();
    gameID = await createGame(gameName);
    showIdContainer.innerHTML = `${gameName} (copied to clipboard)`;
    copyToClipboard(gameName);
    gameLoop(gameID);
    initial.classList.add("hidden");
  } else if (startClick) console.log("Du har redan klickat!");
});
let joinClick = false;
joinForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!joinClick) {
    joinClick = true;
    player1 = false;
    let joinInput = document.querySelector(".join-input").value;
    showIdContainer.innerHTML = `${joinInput} (copied to clipboard)`;
    initial.classList.add("hidden");
    gameID = await findGameID(joinInput);
    await player2join(gameID);
    gameLoop(gameID);
  }
  //player1 = true;
});

let restartButton = document.getElementById("restart-button");
restartButton.addEventListener("click", (event) => {
  event.preventDefault();
  restartGame(oldGameNumber, gameID)
  restart.classList.add("hidden")
});

let deleteButton=document.getElementById("delete-button")
deleteButton.addEventListener('click', (event) => {
  event.preventDefault();
  deleteGame(gameID)
});

