// #region ===== Auth toggle

let authMode = "signin";

function toggleAuthMode() {
  authMode = authMode === "signin" ? "signup" : "signin";

  document.getElementById("auth-submit-btn").textContent =
    authMode === "signup" ? "Sign Up" : "Sign In";
  document.getElementById("auth-toggle-text").textContent =
    authMode === "signup"
      ? "Already have an account?"
      : "Don't have an account?";
  document.getElementById("auth-toggle-link").textContent =
    authMode === "signup" ? "Sign in" : "Sign up";
  document.getElementById("auth-error").textContent = "";
}

// #endregion

// #region ===== Forgot password

async function handleForgotPassword() {
  const email = document.getElementById("auth-email").value.trim();
  const errorEl = document.getElementById("auth-error");

  if (!email) {
    errorEl.textContent = "Please enter your email first";
    return;
  }

  try {
    await window.resetPassword(email);
    errorEl.style.color = "var(--green)";
    errorEl.textContent = "Check your inbox or spam/junk folder";
  } catch (e) {
    errorEl.style.color = "var(--red)";
    errorEl.textContent = friendlyAuthError(e.code);
  }
}

// #endregion

// #region ===== Submit Handler

async function submitAuth() {
  const email = document.getElementById("auth-email").value.trim();
  const password = document.getElementById("auth-password").value;

  const errorEl = document.getElementById("auth-error");

  errorEl.textContent = "";

  if (!email || !password) {
    errorEl.textContent = "Email and password are required.";
    return;
  }

  document.getElementById("form-wrap").style.display = "none";
  document.getElementById("pin-loading").style.display = "flex";

  try {
    if (authMode === "signup") {
      window.currentUser = await window.signUp(email, password);
    } else {
      window.currentUser = await window.signIn(email, password);
    }
  } catch (e) {
    errorEl.textContent = friendlyAuthError(e.code);
    document.getElementById("pin-loading").style.display = "none";
    document.getElementById("form-wrap").style.display = "flex";
  }
}

document
  .getElementById("auth-password")
  .addEventListener("keydown", function (e) {
    if (e.key === "Enter") submitAuth();
  });

function handleAuthSubmit(e) {
  e.preventDefault();
  submitAuth();
}

// #endregion

// #region ===== Friendly auth errors

function friendlyAuthError(code) {
  const map = {
    "auth/email-already-in-use":
      "You're already signed up! Try logging in instead",
    "auth/invalid-email": "Hmm, that email doesn't look right",
    "auth/weak-password": "Password should be at least 6 characters",
    "auth/user-not-found": "No account found with that email",
    "auth/wrong-password": "That password didn't match, try again",
    "auth/invalid-credential": "Incorrect email or password",
  };
  return map[code] || "Something went wrong. Try again.";
}

// #endregion

// #region ===== Password visibility toggle

let passwordVisible = false;

function togglePasswordVisibility() {
  const input = document.getElementById("auth-password");
  const icon = document.getElementById("password-toggle-icon");
  passwordVisible = !passwordVisible;
  input.type = passwordVisible ? "text" : "password";
  icon.dataset.icon = passwordVisible ? "eye-open" : "eye-closed";
  injectIcons(icon.parentElement);
}

// #endregion

// #region ===== Guest mode auth

function enterGuestMode() {
  sessionStorage.setItem("guestMode", "true");
  window.location.href = "/app.html";
}

// #endregion

// #region ===== Redirect promise

waitForFirebaseReady(() => {
  window.onAuthReady((user) => {
    if (user) {
      window.location.href = "/app.html";
    } else {
      document.getElementById("auth-screen").style.display = "flex";
      document.getElementById("auth-email").focus();
    }
  });
});

// #endregion
