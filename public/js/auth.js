const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

async function submitAuth(endpoint, payload) {
    const errorElement = document.getElementById("authError");
    const submitButton = document.getElementById("submitBtn");

    errorElement.textContent = "";
    submitButton.disabled = true;
    submitButton.textContent = "Please wait...";

    try {
        const response = await fetch(`/api/auth/${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Something went wrong.");
        }

        localStorage.setItem("velouraToken", result.token);
        localStorage.setItem("velouraUser", JSON.stringify(result.user));

        window.location.href = "/";
    } catch (error) {
        errorElement.textContent =
            error.message || "Unable to connect. Please try again.";
    } finally {
        submitButton.disabled = false;
        submitButton.textContent =
            endpoint === "login" ? "Sign in ↗" : "Create account ↗";
    }
}

if (loginForm) {
    loginForm.addEventListener("submit", event => {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        submitAuth("login", { email, password });
    });
}

if (signupForm) {
    signupForm.addEventListener("submit", event => {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        submitAuth("signup", { name, email, password });
    });
}