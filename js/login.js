window.onload = loaded;

/**
 * Runs when the browser is finished loading.
 */
function loaded() {
    if (sessionStorage.getItem("userId")) {
        window.location.href = "/dashboard.html";
    }
}

const loginForm = document.getElementById("login-form");
const togglePasswordButton = document.getElementById("toggle-show");
const passwordField = document.getElementById("password");

loginForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const usernameField = document.getElementById("username");
    const username = usernameField.value.trim();
    const password = passwordField.value.trim();
    const loginError = document.getElementById("login-error");

    try {
        const response = await fetch("https://w450sz6yzd.execute-api.us-east-2.amazonaws.com/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password,
            })
        });

        const data = await response.json();

        if (!response.ok) {
            loginError.hidden = false;
            throw new Error("Login Failed:", data);
        }
        loginError.hidden = true;
        console.log("Login successful:", data);
        sessionStorage.setItem("userId", data.userId);
        sessionStorage.setItem("username", data.username);
        window.location.href = "/dashboard.html";
    } catch (error) {
        console.error(error);
    }
});

togglePasswordButton.addEventListener("click", function() {
    const isHidden = passwordField.type === "password";
    const eyeIcon = document.getElementById("eye");

    passwordField.type = isHidden ? "text" : "password";
    eyeIcon.src = isHidden ? "/img/eye.svg" : "/img/eye-slash.svg";
    togglePasswordButton.title = isHidden ? "Hide Password" : "Show Password";
    togglePasswordButton.setAttribute("aria-label", isHidden ? "Hide Password" : "Show Password");
});