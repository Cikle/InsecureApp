var tokenKey = 'jwtToken';

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload); // Enthält payload.role
}

function onLogin() {
    fetch("/api/Login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            Username: document.getElementById("username").value,
            Password: document.getElementById("password").value
        })
    })
        .then(response => response.text())
        .then(token => {
            localStorage.setItem(tokenKey, token);
            window.location.href = "index.html";
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
// Updated onLogin function to include 2FA code
function onLogin() {
   var inputUsername = document.getElementById('username');
   var inputPassword = document.getElementById('password');
   var inputTwoFactorCode = document.getElementById('twoFactorCode');

   if (!inputUsername.value) {
       toastr.warning('Username cannot be empty', 'Warning');
   }
   else if (!inputPassword.value) {
       toastr.warning('Password cannot be empty', 'Warning');
   }
   else {
       fetch('/api/Login/', {
           method: 'POST',
           headers: {
               'Accept': 'application/json',
               'Content-Type': 'application/json'
           },
           body: JSON.stringify({
               Username: inputUsername.value,
               Password: inputPassword.value,
               TwoFactorCode: inputTwoFactorCode?.value
           })
       })
       .then((response) => {
           if (response.ok) {
               return response.json();
           }
           else {
               return response.text().then(text => {
                   throw new Error(text || response.statusText);
               });
           }
       })
       .then((token) => {
           localStorage.setItem('jwtToken', token);
           window.location.href = "index.html";
       })
       .catch((error) => {
           toastr.error(error.message, 'Login Failed');
       });
   }
}

// Added 2FA input field to the login form
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

   /* 2FA Code */
   var labelTwoFactor = document.createElement('label');
   labelTwoFactor.innerText = '2FA Code (if enabled):';

   var inputTwoFactor = document.createElement('input');
   inputTwoFactor.type = 'text';
   inputTwoFactor.id = 'twoFactorCode';

   var divTwoFactor = document.createElement('div');
   divTwoFactor.innerHTML += '<br>';
   divTwoFactor.appendChild(labelTwoFactor);
   divTwoFactor.innerHTML += '<br>';
   divTwoFactor.appendChild(inputTwoFactor);

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
   loginForm.appendChild(divTwoFactor);
   loginForm.appendChild(divButton);

   main.appendChild(loginForm);
}

// Added function to check if 2FA is enabled
function isTwoFactorEnabled(username) {
   // In a real app, you'd check this with an API call
   return false; // Default to false until setup
}
