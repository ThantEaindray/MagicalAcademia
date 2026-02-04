document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  // Your existing navbar IDs
  const profileBtn = document.getElementById("profileButton");
  const logoutBtn = document.getElementById("logoutButton");
  const loginBtn = document.getElementById("loginButton");
  const registerBtn = document.getElementById("registerButton");

  // If no navbar on this page, stop
  if (!profileBtn && !logoutBtn && !loginBtn && !registerBtn) return;

  // Make Logout work everywhere
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault(); // stops jumping to top because href="#"

      localStorage.removeItem("token");
      localStorage.removeItem("loggedInUserId");
      localStorage.removeItem("user");
      window.location.href = "login.html";
    });
  }

  // Toggle buttons
  const hasToken = !!localStorage.getItem("token");

  if (hasToken) {
    profileBtn?.classList.remove("d-none");
    logoutBtn?.classList.remove("d-none");

    loginBtn?.classList.add("d-none");
    registerBtn?.classList.add("d-none");
  } else {
    profileBtn?.classList.add("d-none");
    logoutBtn?.classList.add("d-none");

    loginBtn?.classList.remove("d-none");
    registerBtn?.classList.remove("d-none");
  }
});
