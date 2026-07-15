const reactionBox = document.getElementById("reactionBox");
const instructionBox = document.getElementById("instructionBox");
const statusMessage = document.getElementById("statusMessage");

const lastTimeText = document.getElementById("lastTime");
const bestTimeText = document.getElementById("bestTime");
const roundCountText = document.getElementById("roundCount");

const averageTimeText = document.getElementById("averageTime");
const correctCountText = document.getElementById("correctCount");
const wrongCountText = document.getElementById("wrongCount");

const duck = document.getElementById("duck");
const duckMood = document.getElementById("duckMood");

const happinessBar = document.getElementById("happinessBar");
const happinessValue = document.getElementById("happinessValue");

const historyList = document.getElementById("historyList");

const coinCountText= document.getElementById("coinCount");
const buyGlassesBtn = document.getElementById("buyGlasses");

const successSound = new Audio('win.mp3');
const failSound = new Audio ('fail.mp3');
const quackSound = new Audio('quack.mp3');
const deathSound = new Audio('death.mp3')

const comboCountText = document.getElementById("comboCount");

let duckCoins = 0;
let bestTime = Infinity;

let combo = 0;
let happiness = 100;

let correct = 0;
let wrong = 0;

let totalReaction = 0;
 
let gameStarted = false;
let waitingForGo = false;
let canReact = false;

let startTime = 0;
let timeoutID = null;

let rounds = 0;

const savedBestTime = localStorage.getItem("duckBestTime");
if (savedBestTime) {
    bestTime = parseInt(savedBestTime);
    bestTimeText.textContent = bestTime + " ms";
}

const hasGlasses = localStorage.getItem("hasGlasses");
if (hasGlasses === "true") {
    duck.classList.add("has-glasses");
}

function startRound() {

    gameStarted = true;
    waitingForGo = true;
    canReact = false;


    reactionBox.textContent = "WAIT...";
    reactionBox.className ="wait";

    instructionBox.textContent = "Wait until GO appears.";

    statusMessage.textContent = "Get ready...";

    const delay = Math.random() * 4000 + 1000;

    timeoutID = setTimeout(showGo, delay);
} 
function showGo(){

    waitingForGo = false;
    canReact = true;

    reactionBox.textContent = "GO!";
    reactionBox.className = "go";

    statusMessage.textContent =
        "PRESS SPACE!";

    startTime = performance.now();

    timeoutID = setTimeout(function(){

        if(!canReact) return;

        canReact = false;

        wrong++;
        rounds++;

        wrongCountText.textContent = wrong;
        roundCountText.textContent = rounds;

        happiness =
            Math.max(0,happiness - 10);

        updateHappiness();

        setDuckMood("sad");

        addHistory("🐢 Too Slow");

        failSound.play();

        reactionBox.textContent =
            "TOO SLOW";

        reactionBox.className = "bad";

        instructionBox.textContent =
            "Press SPACE to try again.";

        statusMessage.textContent =
            "Too slow!";

        checkGameOver();

    },1200);

}

function react(){

    canReact = false;

    const reactionTime =
        Math.round(performance.now() - startTime);
    
    if(reactionTime > 800) {
        combo = 0;
        happiness = Math.max(0, happiness -5);
        failSound.play();
    }

    updateHappiness();

    rounds++;
    correct++;

    roundCountText.textContent = rounds;
    correctCountText.textContent = correct;

    totalReaction += reactionTime;

    const average =
        Math.round(totalReaction / correct);

    averageTimeText.textContent =
        average + " ms";

    lastTimeText.textContent =
        reactionTime + " ms";

    if(reactionTime < bestTime){

        bestTime = reactionTime;

        bestTimeText.textContent =
            reactionTime + " ms";

        localStorage.setItem("duckBestTime", bestTime);

    }

    if(reactionTime < 450){
        duckCoins++;
        coinCountText.textContent = duckCoins;
        combo++;
        happiness =
            Math.min(100,happiness + 5);
        
            successSound.play();

    }

    else{
        combo = 0;
        happiness =
            Math.min(100, happiness + 0);

    }

    updateHappiness();

    setDuckMood(
        reactionTime < 250 ? "happy" : "sad"
    );

    addHistory(reactionTime + " ms");

    reactionBox.textContent =
        reactionTime + " ms";

    reactionBox.className = "good";

    statusMessage.textContent =
        "Press SPACE for next round.";

    instructionBox.textContent =
        "Nice!";

}

    document.addEventListener("keydown", function(event) {
    if(event.code !== "Space") return;
    event.preventDefault();

    quackSound.currentTime = 0;
    quackSound.play();

    if(gameOver){
        restartGame();
        return;
    }

    if (canReact) {
        react();
        return;
    }

    if(waitingForGo) {
        clearTimeout(timeoutID);
        waitingForGo = false;

        wrong++;
        rounds++;
        wrongCountText.textContent=wrong;
        roundCountText.textContent = rounds;
        happiness = Math.max(0, happiness - 15);
        updateHappiness();
        checkGameOver();
        setDuckMood("sad");
        addHistory("False Start");
        reactionBox.textContent = "TOO EARLY!";
        reactionBox.className = "bad";
        instructionBox.textContent = "Press SPACE to try again.";
        statusMessage.textContent = "Oops!"
        combo = 0;
        failSound.play();
        return;
    }

    startRound();
})

function setDuckMood(mood){
    
    duck.classList.remove("happy", "sad","dead","shake");

    if(mood !== "idle"){
        duck.classList.add(mood);
    }

    switch(mood){

        case "happy":
            duckMood.textContent = "Happy :D"
            break;
        case "sad":
            duckMood.textContent = "Sad :("
            break;
         case "dead":
            duckMood.textContent = "Dead X("
            break
        default:
            duckMood.textContent = "Waiting";
    }
}

function updateHappiness(){

    happinessBar.style.width = happiness + "%";

    happinessValue.textContent = happiness;

    happinessBar.classList.remove("high","medium","low");

    if(happiness >= 70){
        happinessBar.classList.add("high");
    }

     else if(happiness >= 35){
        happinessBar.classList.add("medium");
    }

    else{

        happinessBar.classList.add("low");
    }

    
    if (combo >= 5) {
        statusMessage.textContent = "<3 ON FIRE";
        duck.classList.add("shake");
    }
  
}

function addHistory(text){
    const item = document.createElement("li");

    item.textContent = text; 

    historyList.prepend(item);

    while(historyList.children.length > 6){
        historyList.removeChild(historyList.lastChild);
    }
}

function updateAverage(time){
    totalReaction += time;

    const average =
    Math.round(totalReaction / correct);

    averageTimeText.textContent =
    average +" ms";
}

const gameOverScreen =
document.getElementById("gameOverScreen");

let gameOver = false;

function checkGameOver(){
    if(happiness > 0) return;

    gameOver = true;

    setDuckMood("dead");

    reactionBox.textContent = "GAME OVER";
    reactionBox.className = "bad";

    statusMessage.textContent =
    "Ducky lost ALL happiness because of YOU!!!";

    gameOverScreen.classList.remove("hidden");

    deathSound.play();
}

function restartGame(){
    gameOver = false;

    happiness = 100;

    correct = 0;
    wrong = 0;
    rounds =0;

    totalReaction = 0;
    bestTime = Infinity;

    gameStarted = false;
    waitingForGo = false;
    canReact = false;


    updateHappiness();

    setDuckMood("idle");

    correctCountText.textContent = 0;
    wrongCountText.textContent = 0;
    roundCountText.textContent = 0;

    lastTimeText.textContent = "-- ms";
    bestTimeText.textContent = "-- ms";
    averageTimeText.textContent = "-- ms";

    historyList.innerHTML =
    "<li>Nothing yet...</li>";

    reactionBox.textContent = "READY";
    reactionBox.className = "ready";

    instructionBox.innerHTML =
    "Press <strong>SPACE</strong> to begin.";

    statusMessage.textContent = "Waiting...";

    gameOverScreen.classList.add("hidden");

}

buyGlassesBtn.addEventListener("click", () => {
    if (duckCoins >= 10) {
        duckCoins -= 10;
        coinCountText.textContent = duckCoins;
        duck.classList.add("has-glasses");
        localStorage.setItem("hasGlasses", "true");
    } else {
        alert("Not enough coins!");
    }
}); 