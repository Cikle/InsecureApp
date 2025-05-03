var tokenKey = 'jwtToken';

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload); // Enthält payload.role
}

function getUserIdFromToken(token) {
    const payload = parseJwt(token);
    return payload.nameid;
}

function onLogin() {
    var inputUsername = document.getElementById("username");
    var inputPassword = document.getElementById("password");

    fetch("/api/Login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            Username: inputUsername.value,
            Password: inputPassword.value
        })
    })
        .then((response) => {
            if (response.ok) {
                return response.text().then((token) => {
                    localStorage.setItem('jwtToken', token);
                    localStorage.setItem('username', inputUsername.value);
                    localStorage.setItem('userid', getUserIdFromToken(token));
                    window.location.href = "index.html";
                });
            } else {
                return response.text().then((error) => {
                    throw new Error(error || "Login failed");
                });
            }
        })
        .catch((error) => {
            alert(error.message);
        });
}

function toggleDropdown() {
    var dropdownContent = document.getElementById("dropdownContent");
    dropdownContent.style.display = dropdownContent.style.display === "block" ? "none" : "block";
}

function logout() {
    var dropdownContent = document.getElementById("dropdownContent");
    dropdownContent.style.display = dropdownContent.style.display === "block" ? "none" : "block";
    resetUser();
    window.location.href = "index.html";
}

function getTokenData() {
    var token = localStorage.getItem(tokenKey);
    if (!token) return null;
    return parseJwt(token);
}

function getUsername() {
    var tokenData = getTokenData();
    return tokenData?.unique_name;
}

function getUserid() {
    var tokenData = getTokenData();
    return tokenData?.nameid;
}

function resetUser() {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem('username');
    localStorage.removeItem('userid');
}

function isAdmin() {
    const token = localStorage.getItem(tokenKey);
    if (!token) return false;
    const payload = parseJwt(token);
    return payload.role === "admin";
}

function isLoggedIn() {
    return getTokenData() != null;
}

function createLoginForm() {
    /* Title. */
    var mainTitle = document.createElement("h1");
    mainTitle.innerText = "Login";

    var main = document.getElementById("main");
    main.appendChild(mainTitle);

    /* Username. */
    var labelUsername = document.createElement("label");
    labelUsername.innerText = "Username";

    var inputUsername = document.createElement("input");
    inputUsername.id = "username";

    var divUsername = document.createElement("div");
    divUsername.appendChild(labelUsername);
    divUsername.innerHTML += '<br>';
    divUsername.appendChild(inputUsername);

    /* Password. */
    var labelPassword = document.createElement("label");
    labelPassword.innerText = "Password";

    var inputPassword = document.createElement("input");
    inputPassword.id = "password";
    inputPassword.type = "password";

    var divPassword = document.createElement("div");
    divPassword.innerHTML += '<br>';
    divPassword.appendChild(labelPassword);
    divPassword.innerHTML += '<br>';
    divPassword.appendChild(inputPassword);

    /* Result label */
    var labelResult = document.createElement("label");
    labelResult.innerText = "Login result";
    labelResult.id = "labelResult";
    labelResult.classList.add("warning");
    labelResult.classList.add("hidden");

    var divResult = document.createElement("div");
    divResult.appendChild(labelResult);

    /* Login button. */
    var submitButton = document.createElement("input");
    submitButton.type = "submit";
    submitButton.value = "Login";

    var divButton = document.createElement("div");
    divButton.appendChild(submitButton);

    /* Login form. */
    var loginForm = document.createElement("form");
    loginForm.action = "javascript:onLogin()";
    loginForm.appendChild(divUsername);
    loginForm.appendChild(divPassword);
    loginForm.appendChild(divResult);
    loginForm.appendChild(divButton);

    main.appendChild(loginForm);
}

