document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");

  // If not logged in, just go back to login
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("loggedInUserId");

  if (!token || !userId) {
    window.location.href = "login.html";
    return;
  }

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUserId");
    localStorage.removeItem("user");

    window.location.href = "login.html";
  });
});
