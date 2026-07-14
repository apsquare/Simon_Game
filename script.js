"use strict";

import musicUrl from "./assets/music.mp3?url";

// Music
const backgroundMusic = new Audio(musicUrl);
backgroundMusic.loop = true;
backgroundMusic.volume = 0.25;

const colorSequence = [];
let state = 0;
let acceptingInput = false;
let playerInput = [];
let startButton = document.querySelector(".start");
let leftUp = document.querySelector(".leftUp");
let rightUp = document.querySelector(".rightUp");
let leftDown = document.querySelector(".leftDown");
let rightDown = document.querySelector(".rightDown");
let score = document.querySelector(".score div:last-child");
let highScore = document.querySelector(".highScore div:last-child");
let board = document.querySelector(".board");
const glow = document.querySelector(".cursor-glow");

if (window.matchMedia("(pointer: fine)").matches) {
  document.addEventListener("pointermove", function (e) {
    glow.style.left = e.clientX - 75 + "px";
    glow.style.top = e.clientY - 75 + "px";
  });
}

let currentScore = 0;
let currentHighScore = 0;

function checkCurrentScore() {
  if (currentScore > currentHighScore) {
    currentHighScore = currentScore;
    highScore.textContent = currentHighScore;
  }
  if (state !== 0) score.textContent = currentScore;
}

/*
1 --> leftUp
2 --> rightUp
3 --> leftDown
4 --> rightDown 
*/

const generateRandomNumber = function () {
  let number = Math.floor(Math.random() * 4) + 1;

  while (
    colorSequence.length > 0 &&
    colorSequence[colorSequence.length - 1] === number
  ) {
    number = Math.floor(Math.random() * 4) + 1;
  }

  colorSequence.push(number);
  return number;
};

const showSequence = async function () {
  acceptingInput = false;
  for (let i = 0; i < colorSequence.length; i++) {
    if (state != 1) return;
    let activeButton;
    if (colorSequence[i] == 1) {
      activeButton = leftUp;
    } else if (colorSequence[i] == 2) {
      activeButton = rightUp;
    } else if (colorSequence[i] == 3) {
      activeButton = leftDown;
    } else if (colorSequence[i] == 4) {
      activeButton = rightDown;
    }

    activeButton.classList.add("active");
    await new Promise((resolve) => setTimeout(resolve, 500));
    activeButton.classList.remove("active");
    if (state != 1) return;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  acceptingInput = true;
};

const keepRunning = async function () {
  if (state == 0) {
    state = 1;
    acceptingInput = false;
    startButton.textContent = "Stop";
    backgroundMusic.currentTime = 0;
    backgroundMusic.play().catch((error) => {
      console.error("Unable to play background music:", error);
    });
    generateRandomNumber();
    await showSequence();
  } else if (state == 1) {
    acceptingInput = false;
    state = 2;
    startButton.textContent = "Reset";
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;

    checkCurrentScore();
    document
      .querySelectorAll(".btn")
      .forEach((button) => button.classList.remove("active"));
  } else if (state == 2) {
    acceptingInput = false;
    state = 0;
    startButton.textContent = "Start";
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    checkCurrentScore();
    colorSequence.length = 0;
    currentScore = 0;
    playerInput.length = 0;
    score.textContent = 0;
  }
};

startButton.addEventListener("click", function () {
  keepRunning();
});

function gameRun() {
  board.addEventListener("click", async function (e) {
    //Take inputs
    if (state != 1 || !acceptingInput) return;
    if (!e.target.classList.contains("btn")) return;
    if (playerInput.length < colorSequence.length) {
      let pressedButton;
      if (e.target.classList.contains("leftUp")) {
        pressedButton = 1;
      } else if (e.target.classList.contains("rightUp")) {
        pressedButton = 2;
      } else if (e.target.classList.contains("leftDown")) {
        pressedButton = 3;
      } else if (e.target.classList.contains("rightDown")) {
        pressedButton = 4;
      }
      playerInput.push(pressedButton);
      e.target.classList.add("clicked");
      setTimeout(() => e.target.classList.remove("clicked"), 140);
      const currentIndex = playerInput.length - 1;
      if (playerInput[currentIndex] != colorSequence[currentIndex]) {
        state = 2;
        acceptingInput = false;
        startButton.textContent = "Reset";
        checkCurrentScore();
        return;
      }
    }

    if (playerInput.join("") === colorSequence.join("")) {
      currentScore++;
      checkCurrentScore();
      playerInput.length = 0;
      generateRandomNumber();
      await new Promise((resolve) => setTimeout(resolve, 500));
      await showSequence();
    }
  });
}

gameRun();
