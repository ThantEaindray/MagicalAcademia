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

   function makeTitle(row) {
  const desc = (row.description || "").trim();
  if (!desc) return `Challenge #${row.challenge_id}`;
  return desc; // FULL length title
}

  // Pick a nice image based on challenge title/description keywords
  function getChallengeImage(title, description) {
    const text = `${title || ""} ${description || ""}`.toLowerCase();

    if (text.includes("stairs"))
      return "https://i.pinimg.com/1200x/ff/8f/6f/ff8f6fca3ccd877944b45a7d5a61b9bc.jpg";

    if (text.includes("water") || text.includes("hydrate"))
      return "https://i.pinimg.com/736x/9e/56/ea/9e56eaaa5281d818522d60a29e8bdbf2.jpg";

    if (text.includes("sleep"))
      return "https://i.pinimg.com/736x/09/65/de/0965deb6fe7b19842fbc1c221990386c.jpg";

    if (text.includes("walk") || text.includes("steps"))
      return "https://i.pinimg.com/1200x/00/10/1a/00101af8fc9f1cdb28ed929eb83d5a52.jpg";

    if (text.includes("detox"))
      return "https://i.pinimg.com/736x/c8/69/db/c869dbf2cef60e3aa2cbd4089491d35d.jpg";

    if (text.includes("friend"))
      return "https://i.pinimg.com/1200x/ab/ce/a5/abcea5a0750c9aec99ba139ecc6d054d.jpg";

    if (text.includes("desk"))
      return "https://i.pinimg.com/736x/56/0e/d1/560ed19d202da5123567b5c19b9ed72f.jpg";

    if (text.includes("stretch"))
      return "https://i.pinimg.com/736x/9d/f6/e3/9df6e35237455963c0399dce983979f0.jpg";

    if (text.includes("day"))
      return "https://i.pinimg.com/736x/89/94/17/899417897215f425b7bd07cac4aeaa00.jpg";

    if (text.includes("start"))
      return "https://i.pinimg.com/736x/98/a6/83/98a683bbc17584f3d4d6868253f7a15c.jpg";
    
    // fallback
    return "https://i.pinimg.com/1200x/e0/1a/27/e01a27e4c781b701aa84e966951ce160.jpg";
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
      const imgUrl = getChallengeImage(title, description);

      col.innerHTML = `
  <div class="challenge-flip-card h-100">
    <div class="challenge-flip-inner">

      <!-- FRONT -->
      <div class="challenge-front card shadow-sm h-100">
        <img class="challenge-card-img" src="${imgUrl}" alt="${title}">

        <div class="card-body d-flex flex-column">
          <h5 class="card-title text-center mb-2">🎯 ${title}</h5>

          <label class="form-label mt-1 small">Completion notes (optional)</label>
          <textarea
            class="form-control form-control-sm mb-2 challenge-notes"
            rows="2"
            placeholder="E.g. Completed after gym session"
            id="details-${id}"></textarea>

          <button class="btn btn-primary btn-sm w-100 complete-btn" data-id="${id}">
            Complete
          </button>

          <button class="btn btn-outline-light btn-sm w-100 mt-2 details-btn" type="button">
            View Details
          </button>
        </div>
      </div>

      <!-- BACK -->
      <div class="challenge-back card shadow-sm h-100">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title text-center mb-2">📜 Details</h5>

          <div class="challenge-back-scroll small">
            <p class="mb-2">
              ${description}
            </p>

            <div class="text-muted">
              <div><strong>Base Points:</strong> ${points}</div>
              <div><strong>Multiplier:</strong> x${multiplier.toFixed(2)}</div>
              <div>
                <strong>Reward Points:</strong>
                ${points} × ${multiplier.toFixed(2)} = <b>${finalReward}</b> pts
              </div>
              <div><strong>Created by:</strong> Wizard #${creatorId}</div>
            </div>
          </div>

          <button class="btn btn-outline-light btn-sm w-100 mt-2 back-btn" type="button">
            Back
          </button>
        </div>
      </div>

    </div>
  </div>
`;

      const flipCard = col.querySelector(".challenge-flip-card");

      col.querySelector(".details-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        flipCard.classList.add("is-flipped");
      });

      col.querySelector(".back-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        flipCard.classList.remove("is-flipped");
      });

      col.querySelector(".complete-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        completeChallenge(id);
      });
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
          const earned = data?.points_earned ?? "N/A";
          const left = data?.points_after ?? "N/A";

          const modalBody = document.getElementById("completionModalBody");
          if (modalBody) {
            modalBody.innerHTML = `
    <p class="mb-2">Points earned: <b>${earned}</b></p>
    <p class="mb-0">Points left: <b>${left}</b></p>
  `;

            const modalEl = document.getElementById("completionModal");
            if (modalEl && window.bootstrap) {
              const modal = new bootstrap.Modal(modalEl);
              modal.show();
            } else {
              // Fallback if bootstrap JS missing
              alert(
                `Challenge completed! ✨\n\n` +
                `Points earned: ${earned}\n` +
                `Points left: ${left}`
              );
            }
          } else {
            // Fallback if modal HTML not found
            alert(
              `Challenge completed! ✨\n\n` +
              `Points earned: ${earned}\n` +
              `Points left: ${left}`
            );
          }


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
