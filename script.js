const input = document.querySelector(".form__input");
const form = document.querySelector(".form");
const container = document.querySelector(".main__container");

let selectedLetters = [];
let startX = 0;
let startY = 0;
let lettersInitialPositions = [];

let rectSelectionStartX = 0;
let rectSelectionStartY = 0;
let selectionRectangle = null;

function isOverlapping(el1, el2) {
  const rect1 = el1.getBoundingClientRect();
  const rect2 = el2.getBoundingClientRect();
  return !(
    rect1.right < rect2.left ||
    rect1.left > rect2.right ||
    rect1.bottom < rect2.top ||
    rect1.top > rect2.bottom
  );
}

function mouseMove(e) {
  if (selectedLetters.length > 0) {
    const newX = e.clientX - startX;
    const newY = e.clientY - startY;
    selectedLetters.forEach((letter, index) => {
      letter.style.left = `${lettersInitialPositions[index].x + newX}px`;
      letter.style.top = `${lettersInitialPositions[index].y + newY}px`;
    });
  }
}

function mouseUp() {
  if (selectedLetters.length > 0) {
    const letters = document.querySelectorAll(".letter");
    let isColliding = false;
    selectedLetters.forEach((currentLetter) => {
      letters.forEach((letter) => {
        if (letter !== currentLetter && isOverlapping(currentLetter, letter)) {
          isColliding = true;
          const tempX = letter.style.left;
          const tempY = letter.style.top;
          letter.style.left = currentLetter.style.left;
          letter.style.top = currentLetter.style.top;
          currentLetter.style.left = tempX;
          currentLetter.style.top = tempY;
        }
      });
    });
    document.removeEventListener("mousemove", mouseMove);
    document.removeEventListener("mouseup", mouseUp);
  }
}

function handleMouseDown(letterSpan, event) {
  if (event.ctrlKey) {
    if (selectedLetters.includes(letterSpan)) {
      letterSpan.classList.remove("selected");
      const index = selectedLetters.indexOf(letterSpan);
      selectedLetters.splice(index, 1);
      lettersInitialPositions.splice(index, 1);
    } else {
      letterSpan.classList.add("selected");
      selectedLetters.push(letterSpan);
      lettersInitialPositions.push({
        x: letterSpan.offsetLeft,
        y: letterSpan.offsetTop,
      });
    }
  } else {
    selectedLetters.forEach((letter) => letter.classList.remove("selected"));
    selectedLetters = [];
    lettersInitialPositions = [];
    letterSpan.classList.add("selected");
    selectedLetters.push(letterSpan);
    lettersInitialPositions.push({
      x: letterSpan.offsetLeft,
      y: letterSpan.offsetTop,
    });
  }
  if (selectedLetters.length > 0) {
    startX = event.clientX;
    startY = event.clientY;
    selectedLetters.forEach((letter) => {
      letter.style.position = "absolute";
    });
    document.addEventListener("mousemove", mouseMove);
    document.addEventListener("mouseup", mouseUp);
  }
}

function startRectSelection(e) {
  rectSelectionStartX = e.clientX;
  rectSelectionStartY = e.clientY;
  selectionRectangle = document.createElement("div");
  selectionRectangle.classList.add("selection-rectangle");
  selectionRectangle.style.left = `${rectSelectionStartX}px`;
  selectionRectangle.style.top = `${rectSelectionStartY}px`;
  container.appendChild(selectionRectangle);
  document.addEventListener("mousemove", resizeRectSelection);
  document.addEventListener("mouseup", endRectSelection);
}

function resizeRectSelection(e) {
  const width = e.clientX - rectSelectionStartX;
  const height = e.clientY - rectSelectionStartY;
  selectionRectangle.style.width = `${Math.abs(width)}px`;
  selectionRectangle.style.height = `${Math.abs(height)}px`;
  selectionRectangle.style.left = `${Math.min(
    rectSelectionStartX,
    e.clientX
  )}px`;
  selectionRectangle.style.top = `${Math.min(
    rectSelectionStartY,
    e.clientY
  )}px`;

  const letters = document.querySelectorAll(".letter");
  letters.forEach((letter) => {
    const letterRect = letter.getBoundingClientRect();
    const selectionRect = selectionRectangle.getBoundingClientRect();
    if (
      letterRect.left >= selectionRect.left &&
      letterRect.right <= selectionRect.right &&
      letterRect.top >= selectionRect.top &&
      letterRect.bottom <= selectionRect.bottom
    ) {
      letter.classList.add("selected");
      if (!selectedLetters.includes(letter)) {
        selectedLetters.push(letter);
        lettersInitialPositions.push({
          x: letter.offsetLeft,
          y: letter.offsetTop,
        });
      }
    } else {
      letter.classList.remove("selected");
    }
  });
}

function endRectSelection() {
  if (selectionRectangle) {
    container.removeChild(selectionRectangle);
    selectionRectangle = null;
  }
  document.removeEventListener("mousemove", resizeRectSelection);
  document.removeEventListener("mouseup", endRectSelection);
}

const createTextDiv = (e) => {
  e.preventDefault();
  const divText = document.createElement("div");
  divText.classList.add("text__div");
  const lettersArr = input.value.split("");
  lettersArr.forEach((letter) => {
    const letterSpan = document.createElement("span");
    letterSpan.textContent = letter;
    letterSpan.classList.add("letter");
    letterSpan.addEventListener("mousedown", (event) =>
      handleMouseDown(letterSpan, event)
    );
    divText.appendChild(letterSpan);
  });
  container.appendChild(divText);
};

container.addEventListener("mousedown", (event) => {
  if (!event.ctrlKey) {
    startRectSelection(event);
  }
});

form.addEventListener("submit", createTextDiv);
