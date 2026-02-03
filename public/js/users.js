document.addEventListener("DOMContentLoaded", () => {
  console.log("users.js loaded");

  const usersList = document.getElementById("usersList");
  const warningCard = document.getElementById("warningCard");
  const warningText = document.getElementById("warningText");

  const token = localStorage.getItem("token");
  const myUserId = Number(localStorage.getItem("loggedInUserId"));

  if (!token || !myUserId) {
    window.location.href = "login.html";
    return;
  }

  const showWarning = (msg) => {
    warningText.innerText = msg;
    warningCard.classList.remove("d-none");
  };

  const hideWarning = () => {
    warningText.innerText = "";
    warningCard.classList.add("d-none");
  };

  // Gamification routes are under /api/game
  const GAME_API = `${currentUrl}/api/game`;

  // ============================
  // 1) Load users
  // GET /api/users
  // ============================
  function loadUsers() {
    hideWarning();

    fetchMethod(`${currentUrl}/api/users`, (status, data) => {
      console.log("GET users:", status, data);

      if (status !== 200) {
        showWarning(data?.message || "Failed to load users.");
        return;
      }

      if (!Array.isArray(data)) {
        showWarning("Users API did not return an array.");
        return;
      }

      renderUsers(data);
    }, "GET");
  }

  function renderUsers(users) {
    usersList.innerHTML = "";

    if (users.length === 0) {
      usersList.innerHTML = `
        <div class="col-12">
          <div class="alert alert-info mb-0">No users found.</div>
        </div>
      `;
      return;
    }

    users.forEach((u) => {
      const userId = u.user_id ?? u.id;
      const username = u.username ?? `User #${userId}`;
      const points = u.points ?? 0;

      const col = document.createElement("div");
      col.className = "col-md-4";

      col.innerHTML = `
        <div class="card h-100 shadow-sm">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">🧙 ${username}</h5>

            <div class="small text-muted mb-2">
              <div><strong>Points:</strong> ${points}</div>
              <div><strong>Spells:</strong> <span id="spellCount-${userId}">Loading...</span></div>
            </div>

            <div class="mt-auto d-flex gap-2">
              <button class="btn btn-outline-secondary btn-sm view-spells-btn" data-id="${userId}">
                View Spells
              </button>
            </div>
          </div>
        </div>
      `;

      // Load spell count for this user
      loadSpellCount(userId);

      col.querySelector(".view-spells-btn").addEventListener("click", () => {
        viewUserSpells(userId, username);
      });

      usersList.appendChild(col);
    });
  }

  // ============================
  // 2) Load spell count per user
  // GET /api/game/users/:user_id/spells
  // ============================
  function loadSpellCount(userId) {
    fetchMethod(`${GAME_API}/users/${userId}/spells`, (status, data) => {
      const el = document.getElementById(`spellCount-${userId}`);
      if (!el) return;

      if (status !== 200) {
        el.innerText = "-";
        return;
      }

      const spells = Array.isArray(data?.spells) ? data.spells : [];
      el.innerText = spells.length;
    }, "GET");
  }

  // ============================
  // 3) View user spells (simple preview)
  // ============================
  function viewUserSpells(userId, username) {
    fetchMethod(`${GAME_API}/users/${userId}/spells`, (status, data) => {
      if (status !== 200) {
        alert("Failed to load spells.");
        return;
      }

      const spells = Array.isArray(data?.spells) ? data.spells : [];

      if (spells.length === 0) {
        alert(`🧙 ${username}\n\nNo spells owned.`);
        return;
      }

      const list = spells.map((s, i) => {
        const name = s.name ?? "Unknown Spell";
        return `${i + 1}. ${name}`;
      }).join("\n");

      alert(`🧙 ${username}'s Spells\n\n${list}`);
    }, "GET");
  }

  // init
  loadUsers();
});
