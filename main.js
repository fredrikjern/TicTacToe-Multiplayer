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

/**  --- Game loop ---
 *  Incursive loop that updates every UPDATE_INTERVAL [seconds], requests game from API,
 *  checks if someone's won and renders the current game in the DOM.
 * @param {* currentTime is the time since script is loaded?} currentTime
 * @returns {* a String : "game over" when the game is over, loop is ended and game deleted}
 */
async function main(currentTime) {
  try {
    if (currentTime > GAME_LIMIT * 1000) {
      gameOver = true;
      alert("timeout");
    }
    if (gameOver) {
      deleteGame(gameID);
      return console.log("game over");
    }

    const secondsSinceLastRender = currentTime - lastRenderTime;
    if (
      secondsSinceLastRender > UPDATE_INTERVAL * 1000 ||
      lastRenderTime === 0
    ) {
      console.log(currentTime);
      console.log(`${UPDATE_INTERVAL}s uppdatering`);
      lastRenderTime = currentTime;
      let game = await fetchGame(gameID);
      renderBoard(game);
    }
    window.requestAnimationFrame(main); // Den kör sig själv incursive
  } catch (error) {
    console.log(error);
    console.log("feel i main");
  }
}
//window.requestAnimationFrame(main);

/** --- renderBoard ----
 *
 * @param {* Object } game
 */
async function renderBoard(game) {
  gameBoard = game.itemList;
  player1turn = game.player1turn;
  gameContainer.innerHTML = "";
  console.log(gameBoard);
  gameBoard.forEach((item, index) => {
    let div = document.createElement("div");
    div.classList.add("square");
    if (item.checked) {
      div.innerHTML = item.checkedByPlayer1 ? "x" : "o";
      div.classList.add("checked");
    } else {
      div.innerHTML = ` ${index}`; //Ta bort senare
      div.addEventListener("click", async (event) => {
        event.preventDefault();
        console.log("square-klick: " + index);
        await checkSquare(game, index);
        await changeTurn(gameID, player1turn);
      });
    }
    gameContainer.appendChild(div);
  });
}
/**
 *
 * @param {* Full game list from API} game
 * @param {* Index of the square that should be checked} index
 * @returns The new game array? A promise? Check
 */
async function checkSquare(game, index) {
  try {
    let squareID = game.itemList[index]._id;
    console.log(squareID);
    let res = await fetch(`${API_BASE}lists/${game._id}/items/${squareID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        checked: true,
        checkedByPlayer1: game.player1turn ? true : false,
      }),
    });
    let data = await res.json();
    console.log(data);
    console.log("Player1:" + game.player1turn);
    return data;
  } catch (error) {
    console.log(error);
  }
}
/**
 * @param {* The database ID} gameID
 * @param {* Whose turn it is, changes to opposite} player1turn
 */
async function changeTurn(gameID, player1turn) {
  try {
    console.log("changeturn körs med player1turn = " + player1turn);
    let newTurn = player1turn ? false : true;
    /// Borde räcka med att skicka in hela listan och plocka ur data här inne.. mindre parameterar
    await fetch(`${API_BASE}lists/${gameID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        player1turn: newTurn,
      }),
    });
  } catch (error) {
    console.log(error);
  }
}
/** Player 2 join
 * Sends a PUT to change player2: false -> true
 * @param {*} gameID
 * @returns Promise?
 */
async function player2join(gameID) {
  try {
    await fetch(`${API_BASE}lists/${gameID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        player2: true,
      }),
    });
    return true;
  } catch (error) {
    console.log(error);
  }
}
/**
 * @param {String with the gamename} gameName
 * @returns Object / Promise?
 */
async function findGameID(gameName) {
  console.log("find game");
  try {
    let res = await fetch(`${API_BASE}listsearch?listname=${gameName}`);
    let data = await res.json();
    console.log(await data);
    return data;
  } catch (error) {
    console.log(error);
  }
}
/**
 * @param {* String with the gameID} gameID
 * @returns the object list with gameID
 */
async function fetchGame(gameID) {
  try {
    const gameList = await fetch(`${API_BASE}lists/${gameID}`);
    const gameListResult = await gameList.json();
    return gameListResult;
  } catch (error) {
    console.log(error);
  }
}
/**
 * Deletes a list with gameID.
 */
async function deleteGame(gameID) {
  try {
    const res = await fetch(`${API_BASE}lists/${gameID}`, {
      method: "DELETE",
    });
    return console.log("Game deleted");
  } catch (error) {
    console.log(error);
  }
}
/** Creates the list-object in the database through an API
 * @param {* String, name for the list} gameName
 * @returns an object with the property _id
 */
async function createGame(gameName) {
  try {
    const res = await fetch(`${API_BASE}lists`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        listname: gameName,
        player1turn: false,
        player2: false,
      }),
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.log(error);
  }
}
/** Post an object to a list
 * @param {*} gameID
 * @param {* To get a index property} index
 */
async function postObjectToGame(gameID, index) {
  try {
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
    data = await res.json();
    return data;
  } catch (error) {
    console.log(error);
  }
}
/**
 * Generate 9 squares as objects in the database
 * @param {*} gameID
 */
async function generateGameObjects(gameID) {
  try {
    for (let index = 0; index < 9; index++) {
      await postObjectToGame(gameID, index);
    }
  } catch (error) {
    console.log(error);
  }
  return;
}
/**
 * @returns A 6-number-String with random numbers.
 */
function randomNumberStr() {
  let random1 = Math.floor(Math.random() * 9) + 1;
  let random2 = Math.floor(Math.random() * 9) + 1;
  let random3 = Math.floor(Math.random() * 9) + 1;
  let random4 = Math.floor(Math.random() * 9) + 1;
  let random5 = Math.floor(Math.random() * 9) + 1;
  let random6 = Math.floor(Math.random() * 9) + 1;
  return `${random1}${random2}${random3}${random4}${random5}${random6}`;
}
/** Eventlisteners */
// ---- Start Game ----
startGameBtn.addEventListener("click", async function (e) {
  e.preventDefault();
  player1 = true;
  gameName = randomNumberStr();
  showIdContainer.innerHTML = `${gameName} `;
  gameList = await createGame(gameName);
  console.log(gameList);
  gameID = await gameList.list._id; // behövs denna await?
  console.log(gameID);
  await generateGameObjects(gameID);
  game = await fetchGame(gameID);
  console.log(game);
  window.requestAnimationFrame(main);
});
// --- Join ----
joinForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  let joinInput = document.querySelector(".join-input").value;
  console.log("Joining game: " + joinInput);
  let gameID2 = await findGameID(joinInput);
  console.log(gameID2);
  await player2join(await gameID2);
  await fetchGame(gameID2);
  window.requestAnimationFrame(main);
});

gameOverBtn.addEventListener("click", (event) => {
  event.preventDefault();
  gameOver = true;
});
// test runs
// let id = "63f321e5746b831af879cbfa";
// async function asynctest(id) {
//   game = await fetchGame(id);
//   console.log("test");
//   console.log(game);
//   let test = await checkSquare(game, "5");
//   console.log(test);
//   changeTurn(game._id, game.player1turn);
// }
//asynctest(id)
