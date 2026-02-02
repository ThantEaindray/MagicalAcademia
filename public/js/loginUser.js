document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const warningCard = document.getElementById("warningCard");
  const warningText = document.getElementById("warningText");

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    // I do very basic checks here because backend should do the real validation
    if (!email || !password) {
      warningCard.classList.remove("d-none");
      warningText.innerText = "Please enter both email and password.";
      return;
    }

    const data = {
      email: email,
      password: password
    };

    const callback = (responseStatus, responseData) => {
      console.log("responseStatus:", responseStatus);
      console.log("responseData:", responseData);

      if (responseStatus === 200) {
        // backend should return token + userId
        if (responseData.token) {
          localStorage.setItem("token", responseData.token);

          // I keep the same name as the practical so other pages can reuse it
          if (responseData.userId) {
            localStorage.setItem("loggedInUserId", responseData.userId);
          }

          warningCard.classList.add("d-none");

          // after login, go to profile page
          window.location.href = "profile.html";
        } else {
          warningCard.classList.remove("d-none");
          warningText.innerText = "Login success but token missing (check backend response).";
        }
      } else {
        warningCard.classList.remove("d-none");

        // show backend message if available, otherwise fallback
        warningText.innerText = responseData.message || "Login failed. Please try again.";
      }
    };

    // update this endpoint if your backend uses a different path
    // If your Postman login was /api/login, keep it.
    fetchMethod(currentUrl + "/api/login", callback, "POST", data);
  });
});
