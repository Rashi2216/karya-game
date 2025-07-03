let playerName = "";
let playerKey = "";

window.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("termsModal");
  modal.classList.add("active");

  document.getElementById("startBtn").addEventListener("click", () => {
    if (!document.getElementById("termsCheck").checked) {
      alert("Please agree to the terms to continue.");
      return;
    }
    modal.classList.remove("active");
  });
});

document.getElementById("joinForm").addEventListener("submit", function (e) {
  e.preventDefault();
  playerName = document.getElementById("playerName").value.trim();
  if (!playerName) return alert("Enter your name");

  const playerRef = db.ref("players").push();
  playerRef.set({
    name: playerName,
    joinedAt: Date.now(),
    score: 0
  });
  playerKey = playerRef.key;

  document.querySelector(".join-container").style.display = "none";
  document.getElementById("startRoundContainer").classList.remove("hidden");
});

db.ref("players").on("value", (snapshot) => {
  const players = snapshot.val() || {};
  document.getElementById("playerCount").innerText = `Players Joined: ${Object.keys(players).length}/5`;

  // Scoreboard update
  const list = document.getElementById("scoreList");
  list.innerHTML = "";
  const sorted = Object.values(players).sort((a, b) => b.score - a.score);
  sorted.forEach(p => {
    const li = document.createElement("li");
    li.textContent = `${p.name}: ${p.score} point${p.score !== 1 ? "s" : ""}`;
    list.appendChild(li);
  });
  document.getElementById("scoreboard").classList.remove("hidden");
});

document.getElementById("startRoundBtn").addEventListener("click", () => {
  db.ref("currentRound").set({
    startedBy: playerKey,
    playerName: playerName
  });
});

db.ref("currentRound").on("value", (snapshot) => {
  const round = snapshot.val();
  if (!round) return;

  const isStarter = round.startedBy === playerKey;
  document.getElementById("statementInput").classList.toggle("hidden", !isStarter);
  document.getElementById("guessingUI").classList.toggle("hidden", isStarter);
});

document.getElementById("statementForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const s1 = document.getElementById("s1").value;
  const s2 = document.getElementById("s2").value;
  const s3 = document.getElementById("s3").value;
  const truth = document.querySelector("input[name='truth']:checked")?.value;

  if (!truth) return alert("Select the true statement");

  db.ref("statements").set({ s1, s2, s3, truth });
  this.reset();
  document.getElementById("statementInput").classList.add("hidden");
});

db.ref("statements").on("value", (snapshot) => {
  const data = snapshot.val();
  if (!data) return;

  db.ref("currentRound").once("value").then((snap) => {
    if (snap.val()?.startedBy === playerKey) return;

    const list = document.getElementById("statementsList");
    list.innerHTML = "";

    [data.s1, data.s2, data.s3].forEach((stmt, i) => {
      const li = document.createElement("li");
      li.textContent = stmt;
      li.addEventListener("click", () => {
        db.ref("guesses").push({
          player: playerName,
          guess: i + 1,
          time: Date.now()
        });
        document.getElementById("guessingUI").classList.add("hidden");
      });
      list.appendChild(li);
    });
  });
});

db.ref("guesses").on("child_added", (snapshot) => {
  const guessData = snapshot.val();

  db.ref("statements").once("value").then((snap) => {
    const truth = snap.val().truth;
    if (guessData.guess == truth) {
      db.ref("players").once("value").then((playersSnap) => {
        const players = playersSnap.val();
        for (let key in players) {
          if (players[key].name === guessData.player) {
            const score = players[key].score || 0;
            db.ref(`players/${key}/score`).set(score + 1);
          }
        }
      });
    }
  });
});
