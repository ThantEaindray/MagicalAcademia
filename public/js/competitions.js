document.addEventListener("DOMContentLoaded", () => {
  console.log("competitions.js loaded");

  const competitionList = document.getElementById("competitionList");
  const warningCard = document.getElementById("warningCard");
  const warningText = document.getElementById("warningText");

  const token = localStorage.getItem("token");
  const userId = Number(localStorage.getItem("loggedInUserId"));

  // 🔐 Must be logged in
  if (!token || !userId) {
    window.location.href = "login.html";
    return;
  }

  // backend : /api/game/...
  const GAME_API = `${currentUrl}/api/game`;

  const showWarning = (msg) => {
    warningText.innerText = msg;
    warningCard.classList.remove("d-none");
  };

  const hideWarning = () => {
    warningText.innerText = "";
    warningCard.classList.add("d-none");
  };

  // ============================
  // 1) Load competitions
  // GET /api/game/competitions
  // ============================
  function loadCompetitions() {
    hideWarning();

    fetchMethod(`${GAME_API}/competitions`, (status, data) => {
      console.log("GET competitions:", status, data);

      if (status !== 200) {
        showWarning(data?.message || "Failed to load competitions.");
        return;
      }

      if (!Array.isArray(data)) {
        showWarning("Competitions API did not return an array.");
        return;
      }

      renderCompetitions(data);
    }, "GET");
  }

  function renderCompetitions(list) {
    competitionList.innerHTML = "";

    if (list.length === 0) {
      competitionList.innerHTML = `
        <div class="col-12">
          <div class="alert alert-info mb-0">No competitions available.</div>
        </div>
      `;
      return;
    }

    list.forEach((c) => {
      // Common column names (safe mapping)
      const id = c.competition_id ?? c.id;
      const name = c.name ?? "Unnamed Competition";
      const description = c.description ?? "No description provided.";
      const startDate = c.start_date ?? c.startDate ?? null;
      const endDate = c.end_date ?? c.endDate ?? null;

      const startText = startDate ? new Date(startDate).toLocaleDateString() : "-";
      const endText = endDate ? new Date(endDate).toLocaleDateString() : "-";

      const col = document.createElement("div");
      col.className = "col-md-4";

      col.innerHTML = `
        <div class="card h-100 shadow-sm">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">🏆 ${name}</h5>
            <p class="card-text text-muted">${description}</p>

            <div class="small text-muted mb-2">
              <div><strong>Start:</strong> ${startText}</div>
              <div><strong>End:</strong> ${endText}</div>
            </div>

            <div class="mt-auto d-flex gap-2">
              <button class="btn btn-primary btn-sm flex-fill join-btn" data-id="${id}">
                Join
              </button>
              <button class="btn btn-outline-secondary btn-sm flex-fill lb-btn" data-id="${id}">
                Leaderboard
              </button>
            </div>
          </div>
        </div>
      `;

      col.querySelector(".join-btn").addEventListener("click", () => joinCompetition(id));
      col.querySelector(".lb-btn").addEventListener("click", () => viewLeaderboard(id));

      competitionList.appendChild(col);
    });
  }

  // ============================
  // 2) Join competition
  // POST /api/game/competitions/:id/join
  // body: { user_id }
  // ============================
  function joinCompetition(competitionId) {
    hideWarning();

    if (!competitionId) {
      showWarning("Invalid competition ID.");
      return;
    }

    fetchMethod(
      `${GAME_API}/competitions/${competitionId}/join`,
      (status, data) => {
        console.log("POST join:", status, data);

        if (status === 200 || status === 201) {
          alert("Joined competition!");
        } else {
          showWarning(data?.message || "Unable to join competition.");
        }
      },
      "POST",
      { user_id: userId }
    );
  }

  // ============================
  // 3) Preview leaderboard
  // GET /api/game/competitions/:id/leaderboard
  // ============================
  function viewLeaderboard(competitionId) {
    hideWarning();

    if (!competitionId) {
      showWarning("Invalid competition ID.");
      return;
    }

    fetchMethod(
      `${GAME_API}/competitions/${competitionId}/leaderboard`,
      (status, data) => {
        console.log("GET leaderboard:", status, data);

        if (status !== 200) {
          showWarning(data?.message || "Failed to load leaderboard.");
          return;
        }

        if (!Array.isArray(data) || data.length === 0) {
          alert("🏆 Leaderboard\n\nNo participants yet.");
          return;
        }

        const top5 = data.slice(0, 5).map((u, i) => {
          const username = u.username ?? `User #${u.user_id ?? "-"}`;
          const points = u.points ?? 0;
          return `${i + 1}. ${username} — ${points} pts`;
        }).join("\n");

        alert(`🏆 Leaderboard (Top 5)\n\n${top5}`);
      },
      "GET"
    );
  }

  // init
  loadCompetitions();
});
