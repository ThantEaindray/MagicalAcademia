document.addEventListener("DOMContentLoaded", () => {
  console.log("shop.js loaded");

  const spellList = document.getElementById("spellList");
  const warningCard = document.getElementById("warningCard");
  const warningText = document.getElementById("warningText");

  const wizardName = document.getElementById("wizardName");
  const wizardPoints = document.getElementById("wizardPoints");
  const inventoryHint = document.getElementById("inventoryHint");

  const token = localStorage.getItem("token");
  const userId = Number(localStorage.getItem("loggedInUserId"));

  // 🔐 Must be logged in to shop
  if (!token || !userId) {
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

  let ownedSpellIds = new Set();

  // ----------------------------
  // 1) Load spells (shop list)
  // GET /game/spells
  // ----------------------------
  function loadShop() {
    hideWarning();

    fetchMethod(currentUrl + "/api/game/spells", (status, data) => {
      console.log("GET /game/spells", status, data);

      if (status !== 200) {
        showWarning(data?.message || "Failed to load spells.");
        return;
      }

      if (!Array.isArray(data)) {
        showWarning("Backend did not return an array for spells.");
        return;
      }

      renderSpells(data);
    }, "GET");
  }

  // ----------------------------
  // 2) Load user inventory + points
  // GET /game/users/:user_id/spells
  // returns { user_id, username, points, spells: [...] }
  // ----------------------------
  function loadInventoryAndPoints() {
    hideWarning();

    fetchMethod(`${currentUrl}/api/game/users/${userId}/spells`, (status, data) => {
      console.log("GET inventory", status, data);

      if (status !== 200) {
        showWarning(data?.message || "Failed to load inventory.");
        return;
      }

      wizardName.innerText = data.username ?? `Wizard #${data.user_id}`;
      wizardPoints.innerText = data.points ?? 0;

      const spells = Array.isArray(data.spells) ? data.spells : [];
      ownedSpellIds = new Set(spells.map(s => s.spell_id));

      inventoryHint.innerText =
        spells.length === 0
          ? "You have no spells yet. Buy your first spell below!"
          : `You own ${spells.length} spell(s).`;

      // Update button states after inventory loads
      updateOwnedButtons();
    }, "GET");
  }

  function renderSpells(spells) {
    spellList.innerHTML = "";

    if (spells.length === 0) {
      spellList.innerHTML = `
        <div class="col-12">
          <div class="alert alert-info mb-0">No spells available in the shop.</div>
        </div>
      `;
      return;
    }

    spells.forEach((s) => {
      // from model: Spells table columns include spell_id, name, effect, cost_points :contentReference[oaicite:4]{index=4}
      const id = s.spell_id;
      const name = s.name;
      const effect = s.effect;
      const cost = Number(s.cost_points);

      const col = document.createElement("div");
      col.className = "col-md-4";

      col.innerHTML = `
        <div class="card h-100 shadow-sm">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">✨ ${name}</h5>
            <p class="card-text text-muted">${effect}</p>

            <div class="small text-muted mb-2">
              <div><strong>Cost:</strong> ${cost} pts</div>
            </div>

            <div class="mt-auto d-flex justify-content-end">
              <button class="btn btn-primary btn-sm"
                data-spell-id="${id}"
                data-cost="${cost}">
                Buy Spell
              </button>
            </div>
          </div>
        </div>
      `;

      const btn = col.querySelector("button");
      btn.addEventListener("click", () => buySpell(id));

      spellList.appendChild(col);
    });

    // Apply owned state if inventory already loaded
    updateOwnedButtons();
  }

  function updateOwnedButtons() {
    const buttons = document.querySelectorAll("button[data-spell-id]");
    buttons.forEach((btn) => {
      const spellId = Number(btn.getAttribute("data-spell-id"));
      if (ownedSpellIds.has(spellId)) {
        btn.disabled = true;
        btn.classList.remove("btn-primary");
        btn.classList.add("btn-secondary");
        btn.innerText = "Owned";
      }
    });
  }

  // ----------------------------
  // 3) Buy spell
  // POST /game/users/:user_id/buy-spell
  // body: { spell_id }
  // ----------------------------
  function buySpell(spellId) {
    hideWarning();

    const payload = { spell_id: Number(spellId) };

    fetchMethod(
      `${currentUrl}/api/game/users/${userId}/buy-spell`,
      (status, data) => {
        console.log("POST buy-spell", status, data);

        if (status === 200) {
          alert("Spell purchased successfully 🪄");
          // reload inventory + points so UI updates immediately
          loadInventoryAndPoints();
        } else {
          // controller can return:
          // 409 already owned, 400 not enough points, 404 not found :contentReference[oaicite:5]{index=5}
          showWarning(data?.message || "Failed to buy spell.");
        }
      },
      "POST",
      payload
    );
  }

  // init
  loadShop();
  loadInventoryAndPoints();
});
