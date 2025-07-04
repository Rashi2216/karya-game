let playerName = "";
let playerKey = "";
let allPlayers = [];
let currentHostKey = "";
let selectedAvatar = "";

// Consent popup
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("termsModal").classList.add("active");
  document.getElementById("startBtn").addEventListener("click", () => {
    if (!document.getElementById("termsCheck").checked) {
      alert("Please agree to the terms to continue.");
      return;
    }
    document.getElementById("termsModal").classList.remove("active");
  });
});

// Player joins
document.getElementById("joinForm").addEventListener("submit", function (e) {
  e.preventDefault();
  playerName = document.getElementById("playerName").value.trim();
  selectedAvatar = document.querySelector("input[name='avatar']:checked")?.value;

  if (!playerName || !selectedAvatar) {
    alert("Enter your name and select an avatar.");
    return;
  }

  const playerRef = db.ref("players").push();
  playerRef.set({
    name: playerName,
    joinedAt: Date.now(),
    score: 0,
    avatar: selectedAvatar
  });
  playerKey = playerRef.key;

  document.querySelector(".join-container").style.display = "none";
});

// Update scoreboard
db.ref("players").on("value", (snapshot) => {
  const players = snapshot.val() || {};
  allPlayers = Object.entries(players).sort((a, b) => a[1].joinedAt - b[1].joinedAt);

  document.getElementById("playerCount").innerText = `Players Joined: ${allPlayers.length}/5`;

  if (allPlayers.length > 5) {
    alert("Only 5 players allowed!");
    db.ref(`players/${playerKey}`).remove();
    return;
  }

  const scoreList = document.getElementById("scoreList");
  scoreList.innerHTML = "";
  allPlayers
    .sort((a, b) => b[1].score - a[1].score)
    .forEach(([key, player]) => {
      const li = document.createElement("li");
      li.innerHTML = `<img src="assets/characters/${player.avatar}.png" class="avatar"> ${player.name}: ${player.score} point${player.score !== 1 ? "s" : ""}`;
      scoreList.appendChild(li);
    });

  document.getElementById("scoreboard").classList.remove("hidden");
});

// Host rotation
function getNextHostIndex(currentIndex) {
  return (currentIndex + 1) % allPlayers.length;
}

document.getElementById("startRoundBtn").addEventListener("click", () => {
  const currentIndex = allPlayers.findIndex(([key]) => key === currentHostKey);
  const nextIndex = getNextHostIndex(currentIndex === -1 ? 0 : currentIndex);
  const [nextKey, nextPlayer] = allPlayers[nextIndex];

  db.ref("currentRound").set({
    startedBy: nextKey,
    playerName: nextPlayer.name
  });

  currentHostKey = nextKey;
});

// Handle new round
db.ref("currentRound").on("value", (snapshot) => {
  const round = snapshot.val();
  if (!round) return;

  const isStarter = round.startedBy === playerKey;
  currentHostKey = round.startedBy;

  // DEBUG: Always show button
  document.getElementById("hostControls").classList.remove("hidden");
  document.getElementById("statementInput").classList.toggle("hidden", !isStarter);
  document.getElementById("guessingUI").classList.toggle("hidden", isStarter);
});

// Submit statements
document.getElementById("statementForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const s1 = document.getElementById("s1").value.trim();
  const s2 = document.getElementById("s2").value.trim();
  const s3 = document.getElementById("s3").value.trim();
  const truth = document.querySelector("input[name='truth']:checked")?.value;

  if (!s1 || !s2 || !s3 || !truth) {
    alert("Fill all statements and select the true one.");
    return;
  }

  db.ref("statements").set({ s1, s2, s3, truth });
  document.getElementById("statementForm").reset();
  document.getElementById("statementInput").classList.add("hidden");
});

// Display statements to guess
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

// Handle guesses and update score
db.ref("guesses").on("child_added", (snapshot) => {
  const guessData = snapshot.val();

  db.ref("statements").once("value").then((snap) => {
    const correct = snap.val().truth;
    if (guessData.guess == correct) {
      db.ref("players").once("value").then((snap) => {
        const players = snap.val();
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

// Mic record test (simulated)
document.getElementById("recordBtn").addEventListener("click", async () => {
  if (!navigator.mediaDevices) {
    alert("Microphone not supported.");
    return;
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mediaRecorder = new MediaRecorder(stream);
  let chunks = [];

  mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
  mediaRecorder.onstop = () => {
    const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
    const audioURL = URL.createObjectURL(blob);
    const playback = document.getElementById("playback");
    playback.src = audioURL;
    playback.style.display = "block";
  };

  mediaRecorder.start();
  alert("Recording started. Click OK to stop.");
  setTimeout(() => mediaRecorder.stop(), 5000); // Record 5 seconds
});
