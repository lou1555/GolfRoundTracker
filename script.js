const addRoundButton = document.querySelector(".add-round__add-round-button");
const courseDropDownList = document.querySelector(".add-round__dropdown");
const scoreSummaryContainer = document.querySelector(".rounds__col");
const scorecardTable = document.querySelector(".score-container-table");
const submitRoundButton = document.querySelector(
  ".add-round__submit-round-button"
);
const scoreContainer = document.querySelector(".score-container-score");
const roundDate = document.querySelector(".add-round__date-input");
const roundsFilterDropDown = document.querySelector(".rounds__dropdown");
const playerNameInputsContainer = document.querySelector(".player-name-inputs");
const playerNameInputs = {
  player1: document.querySelector(".player1-name"),
  player2: document.querySelector(".player2-name"),
};
const playerScoreDisplays = {
  player1: document.querySelector(
    '.score-container-currentscore[data-player="player1"]'
  ),
  player2: document.querySelector(
    '.score-container-currentscore[data-player="player2"]'
  ),
};
const matchPlayContainer = document.querySelector(".match-play");
const matchPlayText = document.querySelector(".match-play__text");

let parInputs = [];
let playerInputs = { player1: [], player2: [] };
let parField;
const playerTotals = { player1: null, player2: null };
const myRounds = [];

const courses = [
  {
    name: "Whitwood",
    id: 1,
    holes: 9,
    scoreCard: {
      1: 4,
      2: 4,
      3: 3,
      4: 5,
      5: 4,
      6: 3,
      7: 4,
      8: 4,
      9: 4,
    },
  },
  {
    name: "Drax",
    id: 2,
    holes: 9,
    scoreCard: {
      1: 4,
      2: 4,
      3: 4,
      4: 4,
      5: 3,
      6: 4,
      7: 4,
      8: 3,
      9: 4,
    },
  },
];

const defaultPlayerName = (playerKey) =>
  playerKey === "player1" ? "Player 1" : "Player 2";

const createEmptyRound = () => ({
  course: "",
  players: {
    player1: {
      name: defaultPlayerName("player1"),
      scores: {},
      scoreToPar: 0,
      total: 0,
    },
    player2: {
      name: defaultPlayerName("player2"),
      scores: {},
      scoreToPar: 0,
      total: 0,
    },
  },
  dateOfRound: "",
});

let currentRound = createEmptyRound();

const formatScoreToPar = (score) =>
  score > 0 ? `+${score}` : score === 0 ? "Even" : score;

const computeMatchStatus = (round, holeCount) => {
  const p1 = round.players.player1.scores;
  const p2 = round.players.player2.scores;
  const holesToUse =
    holeCount ||
    Math.max(
      Object.keys(p1).length,
      Object.keys(p2).length,
      parInputs.length || 0
    );
  let diff = 0;
  let holesPlayed = 0;

  for (let i = 1; i <= holesToUse; i++) {
    const s1 = p1[i];
    const s2 = p2[i];
    if (s1 === undefined || s2 === undefined || s1 === "" || s2 === "")
      continue;
    holesPlayed += 1;
    if (s1 < s2) diff += 1;
    else if (s2 < s1) diff -= 1;
  }

  const holesLeft = holesToUse - holesPlayed;
  let text = "All square";

  if (!holesPlayed) {
    text = "No holes scored yet";
  } else if (holesLeft >= 0 && Math.abs(diff) > holesLeft) {
    const leader = diff > 0 ? round.players.player1.name : round.players.player2.name;
    text = `${leader} wins ${Math.abs(diff)}&${holesLeft}`;
  } else if (diff > 0) {
    text = `${round.players.player1.name} ${diff} up`;
  } else if (diff < 0) {
    text = `${round.players.player2.name} ${Math.abs(diff)} up`;
  }

  return { text, diff, holesPlayed, holesLeft };
};

const createScoreCard = () => {
  addRoundButton.style.display = "none";
  createDropDownOptionTags();
};

const createCardTable = (courseId) => {
  const selectedCourse = courses.find((item) => item.id == courseId);
  if (!selectedCourse) return;

  const tableBody = document.querySelector("tbody");
  const tableFoot = document.querySelector("tfoot");
  tableBody.innerHTML = "";
  tableFoot.innerHTML = "";
  submitRoundButton.style.display = "none";

  currentRound = createEmptyRound();
  currentRound.course = selectedCourse.name;
  if (roundDate.value) currentRound.dateOfRound = roundDate.value;

  ["player1", "player2"].forEach((playerKey) => {
    const nameValue = playerNameInputs[playerKey].value.trim();
    currentRound.players[playerKey].name =
      nameValue || defaultPlayerName(playerKey);
  });

  let parTotal = 0;
  new Array(selectedCourse.holes).fill(0).forEach((_, index) => {
    const holeNumber = index + 1;
    const row = document.createElement("tr");

    const headerCell = document.createElement("th");
    headerCell.innerText = `${holeNumber}`;
    row.appendChild(headerCell);

    const parCell = document.createElement("td");
    const parDiv = document.createElement("div");
    parDiv.className = "par-score";
    parDiv.innerText = selectedCourse.scoreCard[holeNumber];
    parCell.appendChild(parDiv);
    row.appendChild(parCell);
    parTotal += selectedCourse.scoreCard[holeNumber];

    ["player1", "player2"].forEach((playerKey) => {
      const scoreCell = document.createElement("td");
      const input = document.createElement("input");
      input.type = "number";
      input.min = "1";
      input.className = `user-score ${playerKey}`;
      input.required = true;
      scoreCell.appendChild(input);
      row.appendChild(scoreCell);
    });

    tableBody.appendChild(row);
  });

  parInputs = document.querySelectorAll(".par-score");
  playerInputs.player1 = document.querySelectorAll(".user-score.player1");
  playerInputs.player2 = document.querySelectorAll(".user-score.player2");

  const totalsHeader = document.createElement("th");
  totalsHeader.innerText = "Totals";
  tableFoot.appendChild(totalsHeader);

  parField = document.createElement("td");
  parField.className = "course-par";
  parField.innerText = parTotal;
  tableFoot.appendChild(parField);

  playerTotals.player1 = document.createElement("td");
  playerTotals.player1.className = "gross-score player1-total";
  tableFoot.appendChild(playerTotals.player1);

  playerTotals.player2 = document.createElement("td");
  playerTotals.player2.className = "gross-score player2-total";
  tableFoot.appendChild(playerTotals.player2);

  attachScoreListeners("player1", playerInputs.player1);
  attachScoreListeners("player2", playerInputs.player2);
  calculateOverallScore();

  playerNameInputsContainer.style.display = "flex";
  scorecardTable.style.display = "table";
  scoreContainer.style.display = "block";
  roundDate.style.display = "block";
  matchPlayContainer.style.display = "block";
  matchPlayText.innerText = "All square";
};

function createDropDownOptionTags() {
  courseDropDownList.innerHTML = "";
  courseDropDownList.style.display = "block";
  let defaultOption = document.createElement("option");
  defaultOption.innerText = "--Please Select a course--";
  defaultOption.value = "";
  courseDropDownList.appendChild(defaultOption);
  courses.forEach((course) => {
    let option = document.createElement("option");
    option.innerText = course.name;
    option.value = course.id;
    courseDropDownList.appendChild(option);
  });
}

const attachScoreListeners = (playerKey, inputs) => {
  inputs.forEach((element, index) => {
    element.addEventListener("change", () => {
      currentRound.players[playerKey].scores[index + 1] = element.value
        ? parseInt(element.value)
        : "";
      calculateOverallScore();
      isCardComplete();
    });
  });
};

const calculateOverallScore = () => {
  if (!parInputs.length) return;
  const parValues = Array.from(parInputs).map((input) =>
    parseInt(input.innerText)
  );

  ["player1", "player2"].forEach((playerKey) => {
    let total = 0;
    let scoreToPar = 0;
    playerInputs[playerKey].forEach((input, index) => {
      if (input.value) {
        const value = parseInt(input.value);
        total += value;
        scoreToPar += value - parValues[index];
      }
    });

    currentRound.players[playerKey].total = total;
    currentRound.players[playerKey].scoreToPar = scoreToPar;
    playerScoreDisplays[playerKey].innerText = formatScoreToPar(scoreToPar);
    if (playerTotals[playerKey]) {
      playerTotals[playerKey].innerText = total ? total : "";
    }
  });

  updateMatchPlayStatus();
};

const updateMatchPlayStatus = () => {
  const holes = parInputs.length || 9;
  const { text } = computeMatchStatus(currentRound, holes);
  if (matchPlayText) matchPlayText.innerText = text;
};

const isCardComplete = () => {
  const allScoresEntered = Array.from(
    document.querySelectorAll(".user-score")
  ).every((input) => input.value);

  if (allScoresEntered && roundDate.value) {
    submitRoundButton.style.display = "block";
  }
};

const getRounds = () => {
  let rounds = JSON.parse(localStorage.getItem("rounds") || "[]");
  rounds.forEach((round) => myRounds.push(round));
  displayScores();
};

const normalizeRound = (round) => {
  if (round.players) return round;
  return {
    course: round.course,
    dateOfRound: round.dateOfRound,
    players: {
      player1: {
        name: "Player 1",
        scores: round.scores || {},
        scoreToPar: round.scoreToPar || 0,
        total: round.total || 0,
      },
      player2: {
        name: "Player 2",
        scores: {},
        scoreToPar: 0,
        total: 0,
      },
    },
  };
};

const displayScores = () => {
  scoreSummaryContainer.innerHTML = "";
  myRounds.forEach((round) => {
    createRound(round);
  });
};

const createRound = (round) => {
  const safeRound = normalizeRound(round);
  const match = computeMatchStatus(safeRound);
  let roundCard = document.createElement("div");
  roundCard.className = "round-cards";
  scoreSummaryContainer.appendChild(roundCard);
  let cardContents = `
  <div class="round-card-content">
    <div>Course: ${safeRound.course}</div>
    <div>Round Date: ${safeRound.dateOfRound || "—"}</div>
    <div>${safeRound.players.player1.name}: ${formatScoreToPar(
    safeRound.players.player1.scoreToPar
  )} (Total: ${safeRound.players.player1.total})</div>
    <div>${safeRound.players.player2.name}: ${formatScoreToPar(
    safeRound.players.player2.scoreToPar
  )} (Total: ${safeRound.players.player2.total})</div>
    <div>Match Play: ${match.text}</div>
    </div>
    `;
  roundCard.innerHTML = cardContents;
};

const roundPrimaryTotal = (round) =>
  round.players ? round.players.player1.total : round.total;

const filterRounds = (filter) => {
  switch (filter) {
    case "lowToHigh":
      myRounds.sort((a, b) => roundPrimaryTotal(a) - roundPrimaryTotal(b));
      displayScores();
      break;
    case "highToLow":
      myRounds.sort((a, b) => roundPrimaryTotal(b) - roundPrimaryTotal(a));
      displayScores();
      break;
    case "newest":
      myRounds.sort(
        (a, b) => Date.parse(b.dateOfRound) - Date.parse(a.dateOfRound)
      );
      displayScores();
      break;
    case "older":
      myRounds.sort(
        (a, b) => Date.parse(a.dateOfRound) - Date.parse(b.dateOfRound)
      );
      displayScores();
      break;
  }
};

addRoundButton.addEventListener("click", createScoreCard);
courseDropDownList.addEventListener("change", (e) => {
  if (!e.target.value) return;
  createCardTable(e.target.value);
});
submitRoundButton.addEventListener("click", () => {
  ["player1", "player2"].forEach((playerKey) => {
    currentRound.players[playerKey].name =
      playerNameInputs[playerKey].value.trim() ||
      defaultPlayerName(playerKey);
  });
  calculateOverallScore();
  myRounds.push(JSON.parse(JSON.stringify(currentRound)));
  localStorage.setItem("rounds", JSON.stringify(myRounds));
  displayScores();
});
roundDate.addEventListener("change", () => {
  currentRound.dateOfRound = roundDate.value;
  isCardComplete();
});
["player1", "player2"].forEach((playerKey) => {
  playerNameInputs[playerKey].addEventListener("input", (e) => {
    currentRound.players[playerKey].name =
      e.target.value.trim() || defaultPlayerName(playerKey);
  });
});

roundsFilterDropDown.addEventListener("change", (e) => {
  filterRounds(e.target.value);
});
