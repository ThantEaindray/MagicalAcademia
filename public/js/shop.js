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
    if (!warningText || !warningCard) return;
    warningText.innerText = msg;
    warningCard.classList.remove("d-none");
  };

  const hideWarning = () => {
    if (!warningText || !warningCard) return;
    warningText.innerText = "";
    warningCard.classList.add("d-none");
  };

  // ✅ Bootstrap modal used for "Purchased!" + other messages
  function showShopModal(title, html) {
    const titleEl = document.getElementById("shopModalTitle");
    const bodyEl = document.getElementById("shopModalBody");
    const modalEl = document.getElementById("shopModal");

    if (!modalEl || !window.bootstrap || !titleEl || !bodyEl) {
      // fallback if modal not present / bootstrap missing
      const textFallback = html
        .replace(/<[^>]*>/g, "")
        .replace(/\s+\n/g, "\n")
        .trim();
      alert(`${title}\n\n${textFallback}`);
      return;
    }

    titleEl.textContent = title;
    bodyEl.innerHTML = html;

    new bootstrap.Modal(modalEl).show();
  }

  let ownedSpellIds = new Set();

  // ----------------------------
  // 1) Load spells (shop list)
  // GET /game/spells
  // ----------------------------
  function loadShop() {
    hideWarning();

    fetchMethod(`${currentUrl}/api/game/spells`, (status, data) => {
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

      if (wizardName) wizardName.innerText = data.username ?? `Wizard #${data.user_id}`;
      if (wizardPoints) wizardPoints.innerText = data.points ?? 0;

      const spells = Array.isArray(data.spells) ? data.spells : [];
      ownedSpellIds = new Set(spells.map((s) => Number(s.spell_id)));

      if (inventoryHint) {
        inventoryHint.innerText =
          spells.length === 0
            ? "You have no spells yet. Buy your first spell below!"
            : `You own ${spells.length} spell(s).`;
      }

      updateOwnedButtons();
    }, "GET");
  }

  function renderSpells(spells) {
    if (!spellList) return;
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
      const id = Number(s.spell_id);
      const name = s.name ?? "Unknown Spell";
      const effect = s.effect ?? "";
      const cost = Number(s.cost_points ?? 0);

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
      btn.addEventListener("click", () => buySpell(id, name, cost));

      spellList.appendChild(col);
    });

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
  function buySpell(spellId, spellName, cost) {
  hideWarning();

  // ✅ FRONTEND CHECK: show same shop modal if not enough points
  const currentPoints = Number(wizardPoints?.innerText ?? 0);
  const numericCost = Number(cost);

  if (currentPoints < numericCost) {
    const need = numericCost - currentPoints;

    showShopModal(
      "Not enough points 😭",
      `
        <p class="mb-2"><strong>Spell:</strong> ${spellName}</p>
        <p class="mb-2">Your points: <b>${currentPoints}</b></p>
        <p class="mb-0">You need <b>${need}</b> more points (Cost: ${numericCost})</p>
      `
    );
    return; // stop here, don't call backend
  }

  const payload = { spell_id: Number(spellId) };

  fetchMethod(
    `${currentUrl}/api/game/users/${userId}/buy-spell`,
    (status, data) => {
      console.log("POST buy spell", status, data);

      if (status === 200 || status === 201) {
        const msg = data?.message || "Spell purchased successfully ✨";
        const spent = data?.points_spent ?? data?.cost_points ?? cost ?? null;
        const left = data?.points_after ?? null;

        showShopModal(
          "Purchased! ✨",
          `
            <p class="mb-2">${msg}</p>
            ${spent !== null ? `<p class="mb-1">Points spent: <b>${spent}</b></p>` : ""}
            ${left !== null ? `<p class="mb-0">Points left: <b>${left}</b></p>` : ""}
          `
        );

        loadInventoryAndPoints();
        loadShop();
        return;
      }

      showShopModal(
        "Oops ❗",
        `<p class="mb-0">${data?.message || "Unable to purchase spell."}</p>`
      );
    },
    "POST",
    payload
  );
}

  // init
  loadShop();
  loadInventoryAndPoints();
});
