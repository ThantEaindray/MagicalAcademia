document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const warningCard = document.getElementById("warningCard");
  const warningText = document.getElementById("warningText");

  const showWarning = (msg) => {
    warningCard.classList.remove("d-none");
    warningText.innerText = msg;
  };

  if (!loginForm) {
    console.error("loginForm not found");
    return;
  }

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault(); // ALWAYS prevent default first

    // NOW check helpers (instead of returning before listener is attached)
    if (typeof fetchMethod !== "function") {
      console.error("fetchMethod is not defined (check js/queryCmds.js loaded)");
      showWarning("System error: fetchMethod not loaded. Check queryCmds.js path.");
      return;
    }
    if (typeof currentUrl !== "string") {
      console.error("currentUrl is not defined (check js/getCurrentURL.js loaded)");
      showWarning("System error: currentUrl not loaded. Check getCurrentURL.js path.");
      return;
    }

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (!username || !password) {
      showWarning("Wizard Name and password are required");
      return;
    }

    const data = { username, password };

    fetchMethod(currentUrl + "/api/login", function (responseStatus, responseData) {
      if (responseStatus === 200) {
        localStorage.setItem("token", responseData.token);
        localStorage.setItem("loggedInUserId", responseData.userId);
        window.location.href = "index.html"; // redirect
      } else {
        showWarning(responseData.message || "Login failed");
      }
    }, "POST", data);
  });
});
