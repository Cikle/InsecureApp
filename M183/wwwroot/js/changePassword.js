function onPasswordChange() {
    var inputPassword = document.getElementById('password');
    var inputConfirmPassword = document.getElementById('confirmPassword');

    if (!inputPassword.value) {
        toastr.warning('Password cannot be empty', 'Warning');
    }
    else if (inputPassword.value != inputConfirmPassword.value) {
        toastr.warning('Passwords are not equal', 'Warning');
    }
    else {
        fetch('/api/User/password-update', {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                UserId: getUserid(),
                NewPassword: inputPassword.value,
                isAdmin: isAdmin()
            })
        })
            .then((response) => {
                if (response.ok) {
                    toastr.success(
                        'Password changed',
                        'Success',
                        {
                            timeOut: 2000,
                            fadeOut: 1000,
                            onHidden: function () {
                                window.location.href = "index.html";
                            }
                        }
                    )
                }
                else {
                    toastr.error('Password change failed', 'Error');
                }
            })
            .catch((error) => {
                alert(error);
            });
    }
}

function createChangePasswordForm() {
    /* Title. */
    var mainTitle = document.createElement('h1');
    mainTitle.innerText = 'Change password';

    var requirements = document.createElement('div');
    requirements.classList.add('password-requirements');
    requirements.innerHTML = '<p>Password requirements:</p><ul>' +
        '<li>At least 8 characters</li>' +
        '<li>At least 1 uppercase letter</li>' +
        '<li>At least 1 lowercase letter</li>' +
        '<li>At least 1 number</li>' +
        '<li>At least 1 special character</li></ul>';

    var main = document.getElementById('main');
    main.innerHTML = '';
    main.appendChild(mainTitle);
    main.appendChild(requirements);

    /* Old Password. */
    var labelOldPassword = document.createElement('label');
    labelOldPassword.innerText = 'Old password';

    var inputOldPassword = document.createElement('input');
    inputOldPassword.id = 'oldPassword';
    inputOldPassword.type = 'password';

    var divOldPassword = document.createElement('div');
    divOldPassword.appendChild(labelOldPassword);
    divOldPassword.innerHTML += '<br>';
    divOldPassword.appendChild(inputOldPassword);

    /* New Password. */
    var labelPassword = document.createElement('label');
    labelPassword.innerText = 'New password';

    var inputPassword = document.createElement('input');
    inputPassword.id = 'password';
    inputPassword.type = 'password';

    var divPassword = document.createElement('div');
    divPassword.appendChild(labelPassword);
    divPassword.innerHTML += '<br>';
    divPassword.appendChild(inputPassword);

    /* Confirm Password. */
    var labelConfirmPassword = document.createElement('label');
    labelConfirmPassword.innerText = 'Confirm new password';

    var inputConfirmPassword = document.createElement('input');
    inputConfirmPassword.id = 'confirmPassword';
    inputConfirmPassword.type = 'password';

    var divConfirmPassword = document.createElement('div');
    divConfirmPassword.innerHTML += '<br>';
    divConfirmPassword.appendChild(labelConfirmPassword);
    divConfirmPassword.innerHTML += '<br>';
    divConfirmPassword.appendChild(inputConfirmPassword);

    /* Change button. */
    var submitButton = document.createElement('input');
    submitButton.type = 'submit';
    submitButton.value = 'Change';

    var divButton = document.createElement('div');
    divButton.innerHTML += '<br>';
    divButton.appendChild(submitButton);

    /* Login form. */
    var loginForm = document.createElement('form');
    loginForm.action = 'javascript:onPasswordChange()';
    loginForm.appendChild(divPassword);
    loginForm.appendChild(divConfirmPassword);
    loginForm.appendChild(divButton);

    main.appendChild(loginForm);
}

