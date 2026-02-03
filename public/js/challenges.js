document.addEventListener("DOMContentLoaded", () => {
  console.log("challenges.js loaded"); // if you don't see this, your script isn't loading

  const challengeList = document.getElementById("challengeList");
  const warningCard = document.getElementById("warningCard");
  const warningText = document.getElementById("warningText");

  const token = localStorage.getItem("token");
  const userId = Number(localStorage.getItem("loggedInUserId"));

  if (!token || !userId) {
    window.location.href = "login.html";
    return;
  }

  const showWarning = (msg) => {
    if (!warningCard || !warningText) return alert(msg);
    warningText.innerText = msg;
    warningCard.classList.remove("d-none");
  };

  const hideWarning = () => {
    if (!warningCard || !warningText) return;
    warningText.innerText = "";
    warningCard.classList.add("d-none");
  };

  // Because table has no "challenge_name", create a short title from description
  function makeTitle(row) {
    const desc = (row.description || "").trim();
    if (!desc) return `Challenge #${row.challenge_id}`;
    const words = desc.split(/\s+/).slice(0, 6).join(" ");
    return desc.split(/\s+/).length > 6 ? `${words}...` : words;
  }

  function loadChallenges() {
    hideWarning();

    fetchMethod(currentUrl + "/api/challenges", (status, data) => {
      console.log("GET /api/challenges status:", status);
      console.log("GET /api/challenges data:", data);

      if (status !== 200) {
        showWarning(data?.message || "Failed to load challenges.");
        return;
      }

      if (!Array.isArray(data)) {
        showWarning("Backend did not return an array. Check controller res.json(results).");
        return;
      }

      renderChallenges(data);
    }, "GET");
  }

  function renderChallenges(rows) {
    challengeList.innerHTML = "";

    if (rows.length === 0) {
      challengeList.innerHTML = `
        <div class="col-12">
          <div class="alert alert-info mb-0">No challenges in database yet.</div>
        </div>
      `;
      return;
    }

    rows.forEach((row) => {
      // Match WellnessChallenges columns exactly
      const id = row.challenge_id;
      const creatorId = row.creator_id;
      const description = row.description;
      const points = row.points;
      const multiplier = Number(row.multiplier ?? 1.0);

      const title = makeTitle(row);
      const finalReward = Math.round(points * multiplier);

      const col = document.createElement("div");
      col.className = "col-md-4";

      col.innerHTML = `
        <div class="card h-100 shadow-sm">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${title}</h5>
            <p class="card-text text-muted">${description}</p>

            <div class="small text-muted mb-2">
              <div><strong>Base Points:</strong> ${points}</div>
              <div><strong>Multiplier:</strong> x${multiplier.toFixed(2)}</div>
              <div><strong>Reward:</strong> ${finalReward} pts</div>
              <div><strong>Created by:</strong> Wizard #${creatorId}</div>
            </div>

            <label class="form-label mt-2 small">Completion notes (optional)</label>
            <textarea class="form-control form-control-sm mb-2" rows="2"
              placeholder="E.g. Completed after gym session"
              id="details-${id}"></textarea>

            <div class="mt-auto d-flex justify-content-end">
              <button class="btn btn-primary btn-sm" data-id="${id}">
                Complete
              </button>
            </div>
          </div>
        </div>
      `;

      col.querySelector("button").addEventListener("click", () => completeChallenge(id));
      challengeList.appendChild(col);
    });
  }

  function completeChallenge(challengeId) {
    hideWarning();

    const details = document.getElementById(`details-${challengeId}`)?.value?.trim() || null;

    // Matches your controller: req.body.user_id + req.body.details
    const payload = { user_id: userId, details };

    fetchMethod(
      `${currentUrl}/api/challenges/${challengeId}`,
      (status, data) => {
        console.log("POST complete status:", status, data);

        if (status === 201 || status === 200) {
          alert("Challenge completed! Points earned ✨");
          const box = document.getElementById(`details-${challengeId}`);
          if (box) box.value = "";
        } else {
          showWarning(data?.message || "Unable to complete challenge.");
        }
      },
      "POST",
      payload
    );
  }

  loadChallenges();
});
