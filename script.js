let playerName = "";
let playerKey = "";

// Show terms modal first
document.addEventListener("DOMContentLoaded", function () {
  const joinForm = document.getElementById("joinForm");
  const termsModal = document.getElementById("termsModal");
  const startBtn = document.getElementById("startBtn");
  const termsCheck = document.getElementById("termsCheck");
  const character = document.querySelector(".character-anim");
  const playerCountDisplay = document.getElementById("playerCount");

  const startRoundBtn = document.getElementById("startRoundBtn");
  const startRoundContainer = document.getElementById("startRoundContainer");
  const statementInput = document.getElementById("statementInput");
  const statementForm = document.getElementById("statementForm");
  const guessingUI = document.getElementById("guessingUI");
  const statementsList = document.getElementById("statementsList");

  termsModal.classList.add("show");

  startBtn.addEventListener("click", function () {
    if (!termsCheck.checked) {
      alert("Please agree to the terms and conditions to proceed.");
      return;
    }
    termsModal.classList.remove("show");
    character.classList.add("move");
  });

  joinForm.addEventListener("submit", function (e) {
    e.preventDefault();
    playerName = document.getElementById("playerName").value.trim();
    if (!playerName) {
      alert("Please enter your name to join the game.");
      return;
    }

    const playerRef = db.ref("players").push();
    playerRef.set({
      name: playerName,
      joinedAt: Date.now()
    });
    playerKey = playerRef.key;

    alert(`Welcome, ${playerName}! You've joined the game.`);
    joinForm.reset();
    document.querySelector(".join-container").style.display = "none";
    startRoundContainer.classList.remove("hidden");
  });

  // Realtime player count
  db.ref("players").on("value", (snapshot) => {
    const players = snapshot.val();
    const count = players ? Object.keys(players).length : 0;
    playerCountDisplay.innerText = `Players Joined: ${count}/5`;
  });

  // When someone clicks Start Round
  startRoundBtn.addEventListener("click", () => {
    db.ref("currentRound").set({
      startedBy: playerKey,
      playerName: playerName
    });
  });

  // Show input form only to round starter
  db.ref("currentRound").on("value", (snapshot) => {
    const round = snapshot.val();
    if (!round) return;

    if (round.startedBy === playerKey) {
      statementInput.classList.remove("hidden");
      guessingUI.classList.add("hidden");
    } else {
      statementInput.classList.add("hidden");
      guessingUI.classList.remove("hidden");
    }
  });

  // Submit 3 statements
  statementForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const s1 = document.getElementById("s1").value.trim();
    const s2 = document.getElementById("s2").value.trim();
    const s3 = document.getElementById("s3").value.trim();
    const truth = document.querySelector("input[name='truth']:checked").value;

    db.ref("statements").set({
      s1, s2, s3, truth
    });

    statementForm.reset();
    statementInput.classList.add("hidden");
  });

  // Show statements to guess
  db.ref("statements").on("value", (snapshot) => {
    const data = snapshot.val();
    if (!data || playerKey === snapshot?.ref?.parent?.startedBy) return;

    const { s1, s2, s3 } = data;
    const allStatements = [s1, s2, s3];

    statementsList.innerHTML = "";
    allStatements.forEach((stmt, index) => {
      const li = document.createElement("li");
      li.textContent = stmt;
      li.addEventListener("click", () => {
        db.ref("guesses").push({
          player: playerName,
          guess: index + 1,
          time: Date.now()
        });
        alert("Your guess has been submitted!");
        guessingUI.classList.add("hidden");
      });
      statementsList.appendChild(li);
    });
  });
});
