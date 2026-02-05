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

  // image mapping based on competition name
  function getCompetitionImage(name) {
    const n = (name || "").toLowerCase();

    if (n.includes("triwizard"))
      return "https://i.pinimg.com/1200x/e0/1a/27/e01a27e4c781b701aa84e966951ce160.jpg";

    if (n.includes("dueling"))
      return "https://i.pinimg.com/736x/5d/d6/67/5dd667094d5a3c506c43f83aaa58bda3.jpg";

    if (n.includes("house"))
      return "https://i.pinimg.com/736x/b1/e4/5b/b1e45b560345cb89626ff8224ef2671c.jpg";

    if (n.includes("o.w.l"))
      return "https://i.pinimg.com/736x/2a/81/3b/2a813b6fb9916959cb8a745ae9f4ddb1.jpg";

    if (n.includes("n.e.w.t"))
      return "https://i.pinimg.com/736x/fd/f8/1d/fdf81d83173e14f697218f7adc28e045.jpg";

    return "https://i.pinimg.com/736x/93/42/44/934244a947d2e80617218908c10bda8b.jpg";
  };

  // Determine competition difficulty level
  function getCompetitionDifficulty(name) {
    const n = (name || "").toLowerCase();

    if (n.includes("house") || n.includes("o.w.l"))
      return "Easy";

    if (n.includes("dueling"))
      return "Medium";

    if (n.includes("triwizard") || n.includes("n.e.w.t"))
      return "Hard";

    return "Easy";
  }

  // Gamification multiplier (scales competition points)
  function getCompetitionMultiplier(name) {
    const level = getCompetitionDifficulty(name);

    if (level === "Easy") return 100;
    if (level === "Medium") return 1000;
    if (level === "Hard") return 10000;

    return 100;
  }

  // Base reward before multiplier (simple by difficulty)
  function getBaseRewardPoints(name) {
    const level = getCompetitionDifficulty(name);
    if (level === "Easy") return 20;
    if (level === "Medium") return 40;
    if (level === "Hard") return 60;
    return 20;
  }

  // Difficulty badge styling
  function getDifficultyBadgeClass(name) {
    const level = getCompetitionDifficulty(name);

    if (level === "Easy") return "bg-success";
    if (level === "Medium") return "bg-warning text-dark";
    if (level === "Hard") return "bg-danger";

    return "bg-secondary";
  }

  // ===== Global Bootstrap Modal (Auto Inject) =====

  function ensureModal() {

    if (document.getElementById("globalModal")) return;

    document.body.insertAdjacentHTML("beforeend", `
    <div class="modal fade" id="globalModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">

          <div class="modal-header">
            <h5 class="modal-title" id="globalModalTitle"></h5>
            <button class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body" id="globalModalBody"></div>

          <div class="modal-footer" id="globalModalFooter">
            <button class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>

        </div>
      </div>
    </div>
  `);
  }


  function openModal(title, bodyHtml, footerHtml = null) {

    ensureModal();

    document.getElementById("globalModalTitle").innerText = title;
    document.getElementById("globalModalBody").innerHTML = bodyHtml;

    const footer = document.getElementById("globalModalFooter");

    if (footerHtml) {
      footer.innerHTML = footerHtml;
    }

    const modal = new bootstrap.Modal(document.getElementById("globalModal"));
    modal.show();
  }

  // Show Claim Reward button only if user is Top 3
  function updateClaimButtonIfTop3(competitionId, cardRootEl) {

    fetchMethod(
      `${GAME_API}/competitions/${competitionId}/leaderboard`,
      (status, data) => {

        if (status !== 200 || !Array.isArray(data)) return;

        const top3 = data.slice(0, 3);

        const isTop3 = top3.some(
          (u) => Number(u.user_id) === Number(userId)
        );

        const claimBtn = cardRootEl.querySelector(".claim-btn");

        if (claimBtn && isTop3) {
          claimBtn.classList.remove("d-none");
        }
      },
      "GET"
    );
  }

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

      const col = document.createElement("div");
      col.className = "col-md-4";

      col.innerHTML = `
        <div class="comp-flip-card h-100">
          <div class="comp-flip-inner">

            <!-- FRONT -->
            <div class="comp-flip-front card shadow-sm h-100">
              <img class="comp-card-img" src="${getCompetitionImage(name)}" alt="${name}">

                <div class="card-body d-flex flex-column">
                  <h5 class="card-title text-center">🏆 ${name}</h5>

                  <div class="text-center small mb-3">
                    <span class="badge ${getDifficultyBadgeClass(name)}">
                      Level: ${getCompetitionDifficulty(name)}
                    </span>
                  </div>

                  <div class="mt-auto d-flex gap-2">
                    <button class="btn btn-primary btn-sm flex-fill join-btn" data-id="${id}">
                      Join
                    </button>
                    <button class="btn btn-outline-secondary btn-sm flex-fill lb-btn" data-id="${id}">
                      Leaderboard
                    </button>
                  </div>

                  <button class="btn btn-outline-light btn-sm w-100 mt-2 details-btn" type="button">
                    View Details
                  </button>

                </div>
            </div>

            <!-- BACK -->
            <div class="comp-flip-back card shadow-sm h-100">
              <div class="card-body d-flex flex-column">
                <h5 class="card-title text-center">📜 Details</h5>

<div class="text-center small mb-3">
  <span class="badge ${getDifficultyBadgeClass(name)}">
    Level: ${getCompetitionDifficulty(name)}
  </span>
</div>

<div class="text-center small text-muted mb-2">
  Multiplier: ×${getCompetitionMultiplier(name)}
</div>


<p class="card-text text-muted mb-3">${description}</p>

<ul class="list-unstyled small mb-3">
  <li><strong>Level:</strong> ${getCompetitionDifficulty(name)}</li>
  <li><strong>Multiplier:</strong> ×${getCompetitionMultiplier(name)}</li>

  <li class="mt-2"><strong>Reward (Top 3):</strong></li>
  <li class="ms-3">Base reward: ${getBaseRewardPoints(name)} pts</li>
  <li class="ms-3">Final reward: ${getBaseRewardPoints(name) * getCompetitionMultiplier(name)
        } pts</li>

  <li class="mt-2"><strong>Scoring:</strong></li>
  <li class="ms-3">Per completed challenge: ${10 * getCompetitionMultiplier(name)
        } score</li>
</ul>

<button class="btn btn-success btn-sm w-100 mb-2 claim-btn d-none" type="button" data-id="${id}">
  Claim Reward (Top 3)
</button>

<button class="btn btn-outline-light btn-sm w-100 back-btn" type="button">
  Back
</button>

              </div>
            </div>

          </div>
        </div>
      `;


      col.querySelector(".join-btn").addEventListener("click", () => joinCompetition(id));
      col.querySelector(".lb-btn").addEventListener("click", () => viewLeaderboard(id));
      col.querySelector(".claim-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        claimReward(id, name);
      });


      const flipCard = col.querySelector(".comp-flip-card");

      col.querySelector(".details-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        flipCard.classList.add("is-flipped");
      });

      col.querySelector(".back-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        flipCard.classList.remove("is-flipped");
      });

      updateClaimButtonIfTop3(id, col);
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

  function viewLeaderboard(competitionId) {

    fetchMethod(
      `${GAME_API}/competitions/${competitionId}/leaderboard`,
      (status, data) => {

        if (!Array.isArray(data)) return;

        const rows = data.map((u, i) => {

          let medal = "";

          if (i === 0) medal = "🥇";
          if (i === 1) medal = "🥈";
          if (i === 2) medal = "🥉";

          return `
          <div class="d-flex justify-content-between mb-2">
            <div>${medal} ${u.username}</div>
            <div>${u.score} score</div>
          </div>
        `;
        }).join("");

        openModal("🏆 Leaderboard", rows);
      },
      "GET"
    );
  }

  function claimReward(competitionId, compName) {

    const level = getCompetitionDifficulty(compName);
    const mult = getCompetitionMultiplier(compName);

    const baseReward = getBaseRewardPoints(compName);
    const finalReward = baseReward * mult;

    openModal(
      "🏆 Claim Final Reward",

      `
      <div><strong>${compName}</strong></div>

      <div class="mt-2">
        Level: ${level}
      </div>

      <div>Multiplier: ×${mult}</div>

      <div>Base reward: ${baseReward}</div>

      <div>
        Final reward:
        <strong>${finalReward}</strong>
      </div>
    `,

      `
      <button class="btn btn-secondary" data-bs-dismiss="modal">
        Cancel
      </button>

      <button class="btn btn-success" id="confirmClaimBtn">
        Confirm
      </button>
    `
    );

    setTimeout(() => {

      const confirmBtn = document.getElementById("confirmClaimBtn");

      if (!confirmBtn) return;

      confirmBtn.onclick = () => {

        fetchMethod(
          `${GAME_API}/competitions/${competitionId}/claim`,
          () => loadCompetitions(),
          "POST",
          { user_id: userId }
        );

      };

    }, 0);
  }

  // init
  loadCompetitions();
});
