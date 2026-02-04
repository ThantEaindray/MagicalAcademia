document.addEventListener("DOMContentLoaded", function () {
  const heroImages = [
    "https://i.pinimg.com/736x/93/42/44/934244a947d2e80617218908c10bda8b.jpg",
    "https://i.pinimg.com/736x/6d/4b/f6/6d4bf6b64cdd84e5f7756be9f19aee28.jpg",
    "https://i.pinimg.com/736x/8a/23/ad/8a23add5277422eb1407ffccebee7b4d.jpg"
  ];

  const heroImg = document.getElementById("heroImg");
  if (heroImg) {
    const randomIndex = Math.floor(Math.random() * heroImages.length);
    heroImg.src = heroImages[randomIndex];
    // I set a fallback image just in case one link fails
    heroImg.onerror = () => {
      heroImg.src = heroImages[0];
    };
  }

  const signupForm = document.getElementById("signupForm");
  const warningCard = document.getElementById("warningCard");
  const warningText = document.getElementById("warningText");

  signupForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // small frontend validation to reduce dumb errors
    if (!username || !email || !password || !confirmPassword) {
      warningCard.classList.remove("d-none");
      warningText.innerText = "Please fill in all fields.";
      return;
    }

    if (password !== confirmPassword) {
      warningCard.classList.remove("d-none");
      warningText.innerText = "Passwords do not match.";
      return;
    }

    warningCard.classList.add("d-none");

    const data = {
      username: username,
      email: email,
      password: password,
    };

    const callback = (responseStatus, responseData) => {
      console.log("Register responseStatus:", responseStatus);
      console.log("Register responseData:", responseData);

      // backend returns 200 + token + userId
      if (responseStatus === 200 && responseData.token) {
        localStorage.setItem("token", responseData.token);
        localStorage.setItem("loggedInUserId", responseData.userId);

        // after register, I send them straight to profile so it feels like auto-login
        window.location.href = "index.html";
      } else {
        warningCard.classList.remove("d-none");
        warningText.innerText = responseData.message || "Registration failed.";
      }
    };

    // POST /api/register
    fetchMethod(currentUrl + "/api/register", callback, "POST", data);

    signupForm.reset();
  });
});
