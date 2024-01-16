


let s, hovInd, shared, my, guests;

// Connect to server
async function connectToParty() {
  partyConnect("wss://demoserver.p5party.org", "tictactoe09");
  
  // instantiate shared variables
  guests = partyLoadGuestShareds();
  shared = partyLoadShared("shared", {
    board: [["e", "e", "e"], ["e", "e", "e"], ["e", "e", "e"]],
    turn: 0,
    winner: 0
    }, () => {
        my = partyLoadMyShared({}, () => {
        my.score = 0;
        if (partyIsHost()) {
          my.num = 0;
        }
        else {
          my.num = guests.length
        }

        // for testing purposes --
        // console.log("me", JSON.stringify(my));
        // console.log("guests", guests);
        // console.log("am i host?", partyIsHost());
        
      });
    }
  );
}

// Connect to server before anything else
function preload() {
  connectToParty();
}

// Innitialize canvas and preset modes
function setup() {
  createCanvas(windowWidth, windowHeight);
  s = min(height, width)/4
  textSize(width/40);
  rectMode(CENTER);
  textAlign(CENTER);
  
  noFill()
  stroke("white")
}

// Check if resized and update sizing ratios
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  s = min(height, width)/4
  textSize(width/40);

}

// Main draw loop
function draw() {  
    if (my.num <= 1) update();
  display();
  reassignNum();
}

// Display visual elements
function display() {
  background(0);

  // draw tic tac toe board
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      square(width/2 + (i * s), height/2 + (j * s), s);
      if (shared.board[i + 1][j + 1] == 0) {
        drawX(i,j);
      }
      if (shared.board[i + 1][j + 1] == 1) {
        drawO(i,j);
      }
    }
  }

  // display text
  push();
  fill("white");

  // displays spectator information
  if (my.num >= 2) {
    text(`Position in queue: ${my.num - 1}`, width/4 + (3/2 * s + width)/2, height * 2/4);
    text(`Player ${shared.turn + 1}'s turn`, width/4 + (3/2 * s + width)/2, height * 1/4);
    pop();
    return;
  }

    // displays player information
  text(`Player ${my.num + 1}`, width/4 - (3/2 * s)/2, height * 1/4);
  text(`Score: ${my.score}`, width/4 - (3/2 * s)/2, height * 2/4);
  if (! ( guests.map((e) => e.num).includes((my.num + 1) % 2 ))) {
    text("Waiting for Opponent \n or \n Opponent disconnected", width/4 + (3/2 * s + width)/2, height * 1/4);
  }
  else if (shared.winner) {
    text(`Player ${shared.winner} wins!`, width/4 + (3/2 * s + width)/2, height * 1/4);
  }
  else {
    text(`Player ${shared.turn + 1}'s turn`, width/4 + (3/2 * s + width)/2, height * 1/4);
  }

  // runs if someone has won
  if (shared.winner) {
    fill("green");
    if (my.num == 0) {
      rect(width/4 + (3/2 * s + width)/2, height * 2/4 - 10, s, 2/4 * s)
      text("Restart?", width/4 + (3/2 * s + width)/2, height * 2/4);
    }
    else {
      text(`Waiting for Player 1 \n to restart`, width/4 + (3/2 * s + width)/2, height * 2/4);
    }
  }
  pop();
}

// Draws an X at board[i][j]
function drawX(i, j) {
  line(width/2 + (i * s) - s/4, height/2 + (j * s) - s/4, width/2 + (i * s) + s/4, height/2 + (j * s) + s/4);
  line(width/2 + (i * s) - s/4, height/2 + (j * s) + s/4, width/2 + (i * s) + s/4, height/2 + (j * s) - s/4);
}

// Draws an O at board[i][j]
function drawO(i, j) {
  circle(width/2 + (i * s), height/2 + (j * s), (s / 4 * 2))
}

// Game update logic
function update() {
  
  // specifically for handling game refresh after someone wins
  if (my.num == 0 && 
    mouseX > width/4 + (3/2 * s + width)/2 - s && mouseX < width/4 + (3/2 * s + width)/2 + s &&
    mouseY > height * 2/4 - 10 - s/2 && mouseY < height * 2/4 - 10 + s/2) {
      if (mouseIsPressed) {
        shared.board = [["e", "e", "e"], ["e", "e", "e"], ["e", "e", "e"]];
        shared.winner = ""
      }
    }

  if (shared.turn != my.num) return;

  // only runs if its your turn, takes mouse input to make a move
  if (mouseX >  width/2 - ( 3/2 * s) && mouseX < width/2 + ( 3/2 * s) &&
      mouseY >  height/2 - ( 3/2 * s) && mouseY < height/2 + ( 3/2 * s)) {

    hovInd = {x: floor((mouseX - width/2 + ( 3/2 * s)) / s),
              y: floor((mouseY - height/2 + ( 3/2 * s)) / s)}

    if (mouseIsPressed && shared.board[hovInd.x][hovInd.y] === "e") {
      shared.turn = (shared.turn + 1) % 2;
      shared.board[hovInd.x][hovInd.y] = my.num;
      if (checkForWin(my.num)) {
        my.score += 1;
        shared.winner = my.num + 1;
       }
    }
  }
}

// Checks if the player # right below current user's is empty and reassigns if necessary
function reassignNum() {
  if (my.num >= 1) {
    if (! ( guests.map((e) => e.num).includes(my.num - 1) )) {
      my.num -= 1;;
    }
  } 
}

// Checks the board if player (n + 1) has won
function checkForWin(n) {

  // check columns and rows
  for (let i = 0; i < 3; i++) {
    let vtest = 0, htest = 0;
    for (let j = 0; j < 3; j++) {
      vtest += shared.board[i][j] == n;
      htest += shared.board[j][i] == n;
    }
    if (vtest == 3 || htest == 3) return true;
  }

  // check diagonals
  let dtest1 = 0;
  let dtest2 = 0;
  for (let i = 0; i < 3; i++) {
    dtest1 += shared.board[i][i] == n;
    dtest2 += shared.board[2-i][i] == n;
  }
  return dtest1 == 3 || dtest2 == 3;
}

