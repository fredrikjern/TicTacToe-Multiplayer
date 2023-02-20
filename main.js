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
let game;
let lastRenderTime = 0;
let player1;
let player2;
let gameOver = false;
let gameName;
let gameID;
let player1turn;
/** Game Loop */
async function main(currentTime) {
  try {
    if (currentTime > GAME_LIMIT * 1000) {
      gameOver = true;
      alert("timeout");
    }
    if (gameOver) {
      deleteGame(gameID);
      if (confirm("Game over")) {
        window.location = "/";
      }
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
/**
 * Game functions
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
      div.innerHTML = ` ${index}`;
      div.addEventListener("click", (event) => {
        event.preventDefault();
        console.log("klick " + index);
        // checkSquare(game)
        gameBoard[index].checked = true;
        gameBoard[index].checkedByPlayer1 = player1turn ? "x" : "o";
        checkSquare(game, index);
        changeTurn(gameID, player1turn);
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
async function checkSquare(game, index) {
 
  /// Borde räcka med att skicka in hela listan och plocka ur data här inne.. mindre parameterar
  try {
     let squareID = game.itemList[index]._id;
     console.log(squareID);
    let checkedby = game.player1turn ? true : false;
    gameID = game._id;
     console.log(checkedby);
    let res = await fetch(`${API_BASE}lists/${gameID}/items/${squareID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        checked: true,
        checkedByPlayer1: checkedby,
      }),
    });
    let data = await res.json();
    console.log(data);
    console.log("inne i checkswuare efter cnsl data");
    return data;
  } catch (error) {
    console.log(error);
  }
}
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
  } catch (error) {
    console.log(error);
  }
}
// Create game list function
// start game loop //window.reqAnF

async function fetchGame(gameID) {
  try {
    const gameList = await fetch(`${API_BASE}lists/${gameID}`);
    const gameListResult = await gameList.json();
    return gameListResult;
  } catch (error) {
    console.log(error);
  }
}
async function deleteGame(gameID) {
  try {
    const res = await fetch(
      `https://nackademin-item-tracker.herokuapp.com/lists/${gameID}`,
      {
        method: "DELETE",
      }
    );
    return console.log("Game deleted");
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
function randomNumberStr() {
  let random1 = Math.floor(Math.random() * 9) + 1;
  let random2 = Math.floor(Math.random() * 9) + 1;
  let random3 = Math.floor(Math.random() * 9) + 1;
  let random4 = Math.floor(Math.random() * 9) + 1;
  let random5 = Math.floor(Math.random() * 9) + 1;
  let random6 = Math.floor(Math.random() * 9) + 1;
  return `${random1}${random2}${random3}${random4}${random5}${random6}`;
}
/** Fel sätt
 * // async function getGame(gameID) { FEL sätt
//   const gameList = await fetch(`${API_BASE}lists/${gameID}`);
//   const gameListResult = await gameList.json();
//   return gameListResult;
// }
 */
/**
 * Eventlisteners
 */
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
  //deleteGame(gameID);
  deleteCurrentGame.addEventListener("click", (event) => {
    event.preventDefault();
    deleteGame(gameID);
    console.log("delete gameID: " + gameID);
  });
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

// test runs
let id = "63f321e5746b831af879cbfa";
async function asynctest(id) {
  game = await fetchGame(id);
  console.log("test");
  console.log(game);
  let test = await checkSquare(game, '5');
  console.log(test);
  changeTurn(game._id,game.player1turn)
}
asynctest(id)




