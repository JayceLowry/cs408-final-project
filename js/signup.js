window.onload = loaded;

/**
 * Runs when the browser is finished loading.
 */
function loaded() {
    if (sessionStorage.getItem("userId")) {
        window.location.href = "/dashboard.html";
    }
}

const signupForm = document.getElementById("signup-form");
const passwordField = document.getElementById("password");
const togglePasswordButton = document.getElementById("toggle-show");

signupForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const usernameField = document.getElementById("username");
    const username = usernameField.value.trim();
    const password = passwordField.value.trim();
    const signupError = document.getElementById("signup-error");

    try {
        const response = await fetch("https://w450sz6yzd.execute-api.us-east-2.amazonaws.com/signup", {
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
            signupError.hidden = false;
            signupForm.reset();
            throw new Error("Account Creation Failed:", data.message);
        }
        signupError.hidden = true;
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