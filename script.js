let playerName = "";
let playersJoined = 1;
let gameStarted = false;

// Handle Consent
document.getElementById("startConsentBtn").addEventListener("click", (e) => {
  e.preventDefault();

  const termsModal = document.getElementById("termsModal");
  const termsCheck = document.getElementById("termsCheck");

  if (!termsCheck.checked) {
    alert("You must agree to the terms.");
    return;
  }

  termsModal.classList.add("hidden");
  document.querySelector(".join-container").classList.remove("hidden");
});

// Handle Join Form
document.getElementById("joinForm").addEventListener("submit", (e) => {
  e.preventDefault();
  playerName = document.getElementById("playerName").value.trim();
  if (!playerName) return;

  document.querySelector(".join-container").classList.add("hidden");
  document.getElementById("loading").classList.remove("hidden");

  simulateJoining();
});

// Simulate players joining with 30 second max wait
function simulateJoining() {
  let timeLeft = 30; // seconds
  const maxPlayers = 5;

  const countdown = setInterval(() => {
    timeLeft--;
    console.log(`Time left: ${timeLeft}s`);

    // Simulate random players joining
    if (playersJoined < maxPlayers && Math.random() > 0.4) {
      playersJoined++;
      document.getElementById("playerCount").innerText = `(${playersJoined}/5 joined)`;
    }

    if (playersJoined >= 2 && (playersJoined === maxPlayers || timeLeft <= 0)) {
      clearInterval(countdown);
      startGame();
    }

    if (timeLeft <= 0 && playersJoined < 2) {
      clearInterval(countdown);
      alert("Not enough players joined. Please try again later.");
      location.reload(); // Reset the flow
    }
  }, 1000);
}

// Start the game
function startGame() {
  if (gameStarted) return;
  gameStarted = true;

  document.getElementById("loading").classList.add("hidden");
  document.getElementById("gameContainer").classList.remove("hidden");

  document.getElementById("gameArea").innerHTML = `
    <h3>Submit Your 2 Lies & 1 Truth</h3>
    <form id="statementsForm">
      <input type="text" placeholder="Statement 1" id="stmt1" required><br>
      <input type="text" placeholder="Statement 2" id="stmt2" required><br>
      <input type="text" placeholder="Statement 3" id="stmt3" required><br>
      
      <p>Select the True Statement:</p>
      <label><input type="radio" name="truth" value="1" required> Statement 1</label><br>
      <label><input type="radio" name="truth" value="2"> Statement 2</label><br>
      <label><input type="radio" name="truth" value="3"> Statement 3</label><br><br>

      <button type="submit">Submit Statements</button>
    </form>
  `;

  setupStatementSubmission();
}

// Handle statement form submission
function setupStatementSubmission() {
  const form = document.getElementById("statementsForm");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const stmt1 = document.getElementById("stmt1").value.trim();
    const stmt2 = document.getElementById("stmt2").value.trim();
    const stmt3 = document.getElementById("stmt3").value.trim();
    const truth = document.querySelector('input[name="truth"]:checked');

    if (!stmt1 || !stmt2 || !stmt3 || !truth) {
      alert("Please enter all 3 statements and select the true one.");
      return;
    }

    const truthIndex = parseInt(truth.value);

    console.log("Statements Submitted:", [stmt1, stmt2, stmt3]);
    console.log("True Statement is:", truthIndex);

    document.getElementById("gameArea").innerHTML = `
      <h3>Waiting for others to ask questions via mic...</h3>
    `;
  });
}
