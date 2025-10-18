import "./style.css";

const DEFAULT_START = 1;
const DEFAULT_END = 12;

const shuffle = (list) => {
  const array = [...list];
  for (let i = array.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
  }
  return array;
};

const validateAnswer = (event, hFactor, vFactor, operator) => {
  const element = event.target;
  const answer = element.value;
  element.classList.remove("correct", "incorrect");

  if (String(answer).trim() === "") {
    return;
  }

  const answerIsCorrect =
    Number.parseInt(answer, 10) ===
    (operator === "add" ? hFactor + vFactor : hFactor * vFactor);

  if (answerIsCorrect) {
    element.classList.add("correct");
    return true;
  }

  element.classList.add("incorrect");
  return false;
};

const validateGrid = () => {
  const inputs = document.querySelectorAll(".inputCell input");
  for (const input of inputs) {
    input.dispatchEvent(new Event("blur"));
  }
};

const highlightFactors = (hFactor, vFactor) => {
  const HIGHLIGHT_CLASS = "highlighted";
  for (const header of document.querySelectorAll("th.header")) {
    header.classList.remove(HIGHLIGHT_CLASS);
  }
  document.getElementById(`v${vFactor}`)?.classList.add(HIGHLIGHT_CLASS);
  document.getElementById(`h${hFactor}`)?.classList.add(HIGHLIGHT_CLASS);
};

const moveTo = (x, y) => {
  document.getElementById(`x${x}y${y}`)?.querySelector("input")?.focus();
};

const handleKeypress = (event, x, y, length) => {
  switch (event.key) {
    case "Enter": {
      let newX;
      let newY;

      if (x + 1 < length) {
        newX = x + 1;
        newY = y;
      } else if (y + 1 < length) {
        newX = 0;
        newY = y + 1;
      } else {
        newX = x;
        newY = y;
      }

      moveTo(newX, newY);
      break;
    }
    default:
      break;
  }
};

const handleKeydown = (event, x, y, length) => {
  let newX = x;
  let newY = y;

  const fieldIsBlank = event.target.value.trim() === "";
  const arrowWasPressed =
    event.key === "ArrowUp" ||
    event.key === "ArrowRight" ||
    event.key === "ArrowDown" ||
    event.key === "ArrowLeft";

  if (arrowWasPressed && !fieldIsBlank) {
    return;
  }

  switch (event.key) {
    case "ArrowUp":
      newX = x;
      newY = y - 1 >= 0 ? y - 1 : y;
      break;
    case "ArrowRight":
      newX = x + 1 <= length ? x + 1 : x;
      newY = y;
      break;
    case "ArrowDown":
      newX = x;
      newY = y + 1 <= length ? y + 1 : y;
      break;
    case "ArrowLeft":
      newX = x - 1 >= 0 ? x - 1 : x;
      newY = y;
      break;
    default:
      break;
  }

  moveTo(newX, newY);
};

const inputCell = (hFactor, vFactor, x, y, length, operator) => {
  const location = `x${x}y${y}`;
  return `
    <td class="input inputCell" id="${location}">
      <input 
        type="text" 
        class="input"
        onblur="validateAnswer(event, ${hFactor}, ${vFactor}, '${operator}')"
        onfocus="highlightFactors(${hFactor}, ${vFactor})"
        onkeypress="handleKeypress(event, ${x}, ${y}, ${length})"
        onkeydown="handleKeydown(event, ${x}, ${y}, ${length})"
      />
    </td>
  `;
};

const blankCell = (value) => `<th class="blank">${value}</th>`;

const headerCell = (value, prefix = "") =>
  `<th class="header" id="${prefix}${value}">${value}</th>`;

const headerRow = (list) => {
  let output = "<tr>";
  output += blankCell("×");

  for (const item of list) {
    output += headerCell(item, "v");
  }

  output += "</tr>";
  return output;
};

const gridRow = (item, hList, y, operator) => {
  let output = "<tr>";

  output += headerCell(item, "h");
  for (const [index, value] of hList.entries()) {
    output += inputCell(item, value, index, y, hList.length, operator);
  }

  output += "</tr>";
  return output;
};

const table = (hList, vList, operator) => {
  let output = '<table id="table" cellspacing="0">';
  output += headerRow(hList);

  for (const [index, item] of vList.entries()) {
    output += gridRow(item, hList, index, operator);
  }

  output += "</table>";
  return output;
};

const shuffledList = (start, end) => {
  let normalizedStart = start;
  let normalizedEnd = end;

  if (normalizedStart > normalizedEnd) {
    [normalizedStart, normalizedEnd] = [normalizedEnd, normalizedStart];
  }

  const list = [];
  const length = normalizedEnd - normalizedStart + 1;

  for (let i = 0; i < length; i++) {
    list[i] = normalizedStart + i;
  }

  return shuffle(list);
};

const elements = {
  output: document.getElementById("output"),
  startField: document.getElementById("start"),
  endField: document.getElementById("end"),
  form: document.getElementById("form"),
  submitButton: document.getElementById("submit"),
  operator: document.getElementById("operator"),
};

const renderGrid = () => {
  const startValue = Number.parseInt(elements.startField.value, 10);
  const endValue = Number.parseInt(elements.endField.value, 10);

  const start = Number.isNaN(startValue) ? DEFAULT_START : startValue;
  const end = Number.isNaN(endValue) ? DEFAULT_END : endValue;

  const hList = shuffledList(start, end);
  const vList = shuffledList(start, end);
  const operator = elements.operator.value;

  elements.startField.value = start;
  elements.endField.value = end;
  elements.output.innerHTML = table(hList, vList, operator);
};

window.addEventListener("DOMContentLoaded", () => {
  elements.submitButton?.addEventListener("click", renderGrid);
  elements.operator?.addEventListener("change", validateGrid);
  renderGrid();
});

Object.assign(window, {
  validateAnswer,
  highlightFactors,
  handleKeypress,
  handleKeydown,
});
