
let s, hovInd, shared, my, guests;

async function connectToParty() {
  partyConnect("wss://demoserver.p5party.org", "tictactoe09");
  
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


        

        console.log("me", JSON.stringify(my));
        console.log("guests", guests);
        console.log("am i host?", partyIsHost());
        
      });
    }
  );
}

function preload() {
  connectToParty();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  s = min(height, width)/4
  textSize(width/40);
  rectMode(CENTER);
  textAlign(CENTER);
  
  
  
  noFill()
  stroke("white")


}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  s = min(height, width)/4
  textSize(width/40);

}

function draw() {  
  background(0);

  console.log(my.num, shared.turn)

  if (my.num <= 1) update();
  display();

  reassignNum();



}



function display() {
  
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

  


  push();
  fill("white");
  if (my.num >= 2) {
    text(`Position in queue: ${my.num - 1}`, width/4 + (3/2 * s + width)/2, height * 2/4);
    text(`Player ${shared.turn + 1}'s turn`, width/4 + (3/2 * s + width)/2, height * 1/4);
    pop();
    return;
  }

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

function drawX(i, j) {
  line(width/2 + (i * s) - s/4, height/2 + (j * s) - s/4, width/2 + (i * s) + s/4, height/2 + (j * s) + s/4);
  line(width/2 + (i * s) - s/4, height/2 + (j * s) + s/4, width/2 + (i * s) + s/4, height/2 + (j * s) - s/4);
}

function drawO(i, j) {
  circle(width/2 + (i * s), height/2 + (j * s), (s / 4 * 2))
}

function update() {
  
  if (my.num == 0 && 
    mouseX > width/4 + (3/2 * s + width)/2 - s && mouseX < width/4 + (3/2 * s + width)/2 + s &&
    mouseY > height * 2/4 - 10 - s/2 && mouseY < height * 2/4 - 10 + s/2) {
      if (mouseIsPressed) {
        shared.board = [["e", "e", "e"], ["e", "e", "e"], ["e", "e", "e"]];
        shared.winner = ""
      }
    }

  if (shared.turn != my.num) return;
  if (mouseX >  width/2 - ( 3/2 * s) && mouseX < width/2 + ( 3/2 * s)
  && mouseY >  height/2 - ( 3/2 * s) && mouseY < height/2 + ( 3/2 * s)) {
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

function reassignNum() {
  if (my.num >= 1) {
    if (! ( guests.map((e) => e.num).includes(my.num - 1) )) {
      my.num -= 1;;
    }
  } 
}

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

