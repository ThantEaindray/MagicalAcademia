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
  };

  fetchMethod(endpoint, callback, "GET");
});
