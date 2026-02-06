document.addEventListener("DOMContentLoaded", () => {
  const warningCard = document.getElementById("warningCard");
  const warningText = document.getElementById("warningText");
  const loadingBox = document.getElementById("loadingBox");
  const profileCard = document.getElementById("profileCard");

  const profileUsername = document.getElementById("profileUsername");
  const profileRole = document.getElementById("profileRole");
  const profileEmail = document.getElementById("profileEmail");
  const profileUserId = document.getElementById("profileUserId");
  const profilePoints = document.getElementById("profilePoints");
  const spellsList = document.getElementById("spellsList");
  const spellsEmpty = document.getElementById("spellsEmpty");
  const completionsList = document.getElementById("completionsList");
  const completionsEmpty = document.getElementById("completionsEmpty");


  const showWarning = (msg) => {
    warningCard.classList.remove("d-none");
    warningText.innerText = msg;
  };

  const hideWarning = () => {
    warningCard.classList.add("d-none");
    warningText.innerText = "";
  };

  // 🔐 Auth check
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("loggedInUserId");

  if (!token || !userId) {
    window.location.href = "login.html";
    return;
  }

  // Safety checks (no endless debug)
  if (typeof fetchMethod !== "function") {
    showWarning("System error: fetchMethod not loaded.");
    return;
  }
  if (typeof currentUrl !== "string") {
    showWarning("System error: currentUrl not loaded.");
    return;
  }

  loadingBox.classList.remove("d-none");

  function loadUserSpells() {
    if (!spellsList || !spellsEmpty) return;

    const spellsEndpoint = `${currentUrl}/api/game/users/${userId}/spells`;

    fetchMethod(spellsEndpoint, (status, data) => {
      console.log("GET user spells:", status, data);

      if (status !== 200) {
        spellsEmpty.classList.remove("d-none");
        spellsEmpty.innerText = data?.message || "Failed to load spells.";
        spellsList.innerHTML = "";
        return;
      }

      const spells = data?.spells;

      if (!Array.isArray(spells) || spells.length === 0) {
        spellsEmpty.classList.remove("d-none");
        spellsEmpty.innerText = "You haven’t bought any spells yet.";
        spellsList.innerHTML = "";
        return;
      }

      spellsEmpty.classList.add("d-none");
      spellsList.innerHTML = "";

      spells.forEach((s) => {
        const col = document.createElement("div");
        col.className = "col-12 col-md-6 col-lg-4";

        col.innerHTML = `
  <div class="card h-100 shadow-sm border-0">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start mb-1">
        <h6 class="card-title mb-0">🪄 ${s.name}</h6>
        <span class="badge bg-success">Owned</span>
      </div>

      <div class="small text-muted mb-2">
        Cost: ${s.cost_points} pts
      </div>

      <p class="small mb-2">${s.effect || ""}</p>

      <div class="small text-muted">
        Unlocked: ${s.unlocked_on
            ? new Date(s.unlocked_on).toLocaleString()
            : "-"}
      </div>
    </div>
  </div>
`;
        spellsList.appendChild(col);
      });
    }, "GET");
  }

  function loadUserCompletions() {
    if (!completionsList || !completionsEmpty) return;

    const endpoint = `${currentUrl}/api/game/users/${userId}/completions`;

    fetchMethod(endpoint, (status, data) => {
      console.log("GET user completions:", status, data);

      if (status !== 200) {
        completionsEmpty.classList.remove("d-none");
        completionsEmpty.innerText = data?.message || "Failed to load completed challenges.";
        completionsList.innerHTML = "";
        return;
      }

      const completions = data?.completions;

      if (!Array.isArray(completions) || completions.length === 0) {
        completionsEmpty.classList.remove("d-none");
        completionsEmpty.innerText = "No challenges completed yet.";
        completionsList.innerHTML = "";
        return;
      }

      completionsEmpty.classList.add("d-none");
      completionsList.innerHTML = "";

      completions.forEach((c) => {
        const base = Number(c.base_points ?? 0);
        const mult = Number(c.multiplier ?? 1);
        const reward = Math.round(base * mult);

        const col = document.createElement("div");
        col.className = "col-12";

        col.innerHTML = `
        <div class="card shadow-sm border-0">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h6 class="mb-1">${c.description || `Challenge #${c.challenge_id}`}</h6>
                <div class="small text-muted">
                  Base: ${base} | Multiplier: x${mult.toFixed(2)} | Reward: <b>${reward}</b>
                </div>
              </div>
              <span class="badge bg-success">Completed</span>
            </div>

            ${c.details ? `<p class="small mt-2 mb-0"><b>Notes:</b> ${c.details}</p>` : ""}

            <div class="small text-muted mt-2">
              Completed on: ${c.completed_at ? new Date(c.completed_at).toLocaleString() : "-"}
            </div>
          </div>
        </div>
      `;

        completionsList.appendChild(col);
      });
    }, "GET");
  }

  function loadJoinedCompetitions() {
    fetchMethod(`${currentUrl}/api/game/users/${userId}/competitions`, (status, data) => {
      if (status !== 200) return;

      const list = Array.isArray(data) ? data : (Array.isArray(data?.competitions) ? data.competitions : []);

      competitionsList.innerHTML = "";

      if (!list || list.length === 0) {
        competitionsEmpty.classList.remove("d-none");
        return;
      }

      competitionsEmpty.classList.add("d-none");

      list.forEach((c) => {
        const name = c.name ?? "Unnamed Competition";
        const joinedAt = c.joined_on ? new Date(c.joined_on).toLocaleString() : "-";

        const col = document.createElement("div");
        col.className = "col-md-4";
        col.innerHTML = `
        <div class="card h-100 shadow-sm">
          <div class="card-body">
            <h6 class="mb-1">🏆 ${name}</h6>
            <div class="small text-muted">Joined: ${joinedAt}</div>
            </div>
          </div>
        </div>
      `;
        competitionsList.appendChild(col);
      });
    }, "GET");
  }
  
  const endpoint = `${currentUrl}/api/users/${userId}`;

  const callback = (status, data) => {
    loadingBox.classList.add("d-none");

    if (status !== 200) {
      showWarning(data?.message || "Failed to load profile.");
      return;
    }

    // Populate UI
    profileUsername.innerText = data.username ?? "Wizard";
    profileRole.innerText = data.role ?? "Student";
    profileEmail.innerText = data.email ?? "-";
    profileUserId.innerText = data.user_id ?? userId;
    profilePoints.innerText = data.points ?? 0;

    profileCard.classList.remove("d-none");
    hideWarning();
    loadUserSpells();
    loadUserCompletions();
    loadJoinedCompetitions();
  };

  fetchMethod(endpoint, callback, "GET");
});
