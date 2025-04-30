window.onload = loaded;

/**
 * Simple Function that will be run when the browser is finished loading.
 */
function loaded() {
    // Assign to a variable so we can set a breakpoint in the debugger!
    const hello = sayHello();
    console.log(hello);

    if (sessionStorage.getItem("userId")) {
        window.location.href = "/dashboard.html";
    }
}

/**
 * This function returns the string 'hello'
 * @return {string} the string hello
 */
export function sayHello() {
    return 'hello';
}

const signupForm = document.getElementById("signup-form");

signupForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const usernameField = document.getElementById("username");
    const username = usernameField.value.trim();
    const passwordField = document.getElementById("password");
    const password = passwordField.value.trim();

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
            alert("User already exists");
            throw new Error("Account Creation Failed:", data.message);
        }
        console.log("Login successful:", data);
        sessionStorage.setItem("userId", data.userId);
        sessionStorage.setItem("username", data.username);
        window.location.href = "/dashboard.html";
    } catch (error) {
        console.error(error);
    }
});