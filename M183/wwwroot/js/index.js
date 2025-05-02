var isInEditMode = false;

function handleEdit(newsEntry) {
    setEditMode(newsEntry);
}

function setEditMode(newsEntry) {
    if (isInEditMode) {
        return;
    }

    var btnEdit = document.getElementById("btnEdit" + newsEntry.id);
    btnEdit.classList.add("notdisplayed");

    var btnDelete = document.getElementById("btnDelete" + newsEntry.id);
    btnDelete.classList.add("notdisplayed");

    var btnSave = document.getElementById("btnSave" + newsEntry.id);
    btnSave.classList.remove("notdisplayed");

    var btnCancel = document.getElementById("btnCancel" + newsEntry.id);
    btnCancel.classList.remove("notdisplayed");

    header = document.getElementById("header" + newsEntry.id);
    header.contentEditable = true;

    detail = document.getElementById("detail" + newsEntry.id);
    detail.contentEditable = true;
    detail.focus();

    isInEditMode = true;
}

function handleDelete(newsEntry) {
    fetch("/api/News/" + newsEntry.id, {
        method: "DELETE",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
        .then((response) => {
            if (response.ok) {
                loadNews();
            }
            else {
                alert("NOK");
            }
        })
        .catch(() => {
            alert("Error");
        });
}

function handleCancel(newsEntry) {
    isInEditMode = false;
    loadNews();
}

function handleSave(newsEntry) {
    isInEditMode = false;
    var detailElement = document.getElementById("detail" + newsEntry.id);
    var data = {
        header: newsEntry.header,
        detail: detailElement.innerText,
        authorId: newsEntry.authorId,
        isAdminNews: newsEntry.isAdminNews
    }

    fetch("/api/News/" + newsEntry.id, {
        method: "PATCH",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then((response) => {
            if (response.ok) {
                loadNews();
            }
            else {
                alert("NOK");
            }
        })
        .catch(() => {
            alert("Error");
        });
}

function loadNews() {
    fetch("/api/News", {
        method: "GET",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('jwtToken') // <-- Token im Header
        }
    })
        .then((response) => {
            if (response.ok) {
                return response.json();
            }
            else {
                throw new Error(response.statusText + " (" + response.status + ")");
            }
        })
        .then((data) => {
            createNewsList(data);
        })
        .catch((error) => {
            alert(error);
        });
}

function createNewsList(data) {
    var currentUserId = getUserid();

    var mainTitle = document.createElement("h1");
    mainTitle.innerText = 'Home';

    var main = document.getElementById("main");
    main.innerHTML = "";
    main.appendChild(mainTitle);

    for (var i = 0; i < data.length; i++) {
        var newsEntry = data[i];

        // Entry.
        var divEntry = document.createElement("div");
        divEntry.classList.add("newsEntry");

        // Header
        var header = document.createElement("div");
        header.classList.add("newsHeader");
        if (newsEntry.isAdminNews) {
            header.classList.add("adminNews");
        }
        header.id = "header" + newsEntry.id;
        header.innerText = newsEntry.header;
        divEntry.appendChild(header);

        // Detail.
        var detail = document.createElement("div");
        detail.id = "detail" + newsEntry.id;
        detail.classList.add("newsDetail");
        detail.innerHTML = newsEntry.detail;
        divEntry.appendChild(detail);

        // Info about user and posted date.
        var newsEntryInfo = document.createElement("div");
        newsEntryInfo.classList.add("newsEntryInfo");
        /** @type {Date} */
        var postedDate = new Date(newsEntry.postedDate);
        var displayedDate = postedDate.getDate() + '.' + (postedDate.getMonth() + 1) + '.' + postedDate.getFullYear();
        displayedDate += ', ' + postedDate.getHours() + ':' + postedDate.getMinutes() + ':' + postedDate.getSeconds();
        newsEntryInfo.innerText = newsEntry.author.username + ', ' + displayedDate;
        divEntry.appendChild(newsEntryInfo);

        if (isAdmin() || newsEntry.authorId == currentUserId) {
            // Edit button.
            var btnEdit = document.createElement("button");
            btnEdit.id = "btnEdit" + newsEntry.id;
            btnEdit.classList.add("btnEdit");
            btnEdit.innerText = "Edit";
            (function (arg) {
                btnEdit.addEventListener("click", function () {
                    handleEdit(arg);
                });
            })(newsEntry);

            // Delete button.
            var btnDelete = document.createElement("button");
            btnDelete.id = "btnDelete" + newsEntry.id;
            btnDelete.classList.add("btnDelete");
            btnDelete.innerText = "Delete";
            (function (arg) {
                btnDelete.addEventListener("click", function () {
                    handleDelete(arg);
                });
            })(newsEntry);

            // Save button.
            var btnSave = document.createElement("button");
            btnSave.id = "btnSave" + newsEntry.id;
            btnSave.classList.add("btnSave");
            btnSave.classList.add("notdisplayed");
            btnSave.innerText = "Save";
            (function (arg) {
                btnSave.addEventListener("click", function () {
                    handleSave(arg);
                });
            })(newsEntry);

            // Cancel button.
            var btnCancel = document.createElement("button");
            btnCancel.id = "btnCancel" + newsEntry.id;
            btnCancel.classList.add("btnCancel");
            btnCancel.classList.add("notdisplayed");
            btnCancel.innerText = "Cancel";
            (function (arg) {
                btnCancel.addEventListener("click", function () {
                    handleCancel(arg);
                });
            })(newsEntry);

            divEntry.appendChild(btnEdit);
            divEntry.appendChild(btnDelete);
            divEntry.appendChild(btnSave);
            divEntry.appendChild(btnCancel);
        }

        main.appendChild(divEntry);
    }
}
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
       .then(response => {  
           if (response.ok) {  
               return response.json();  
           } else {  
               throw new Error('Login failed');  
           }  
       })  
       .then(data => {  
           localStorage.setItem('jwtToken', data.token);  
           window.location.href = '/home';  
       })  
       .catch(error => {  
           toastr.error(error.message, 'Error');  
       });  
   }  
}  

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

/* Login form. */  
var loginForm = document.createElement('form');  
loginForm.action = 'javascript:onLogin()';  
loginForm.appendChild(divUsername);  
loginForm.appendChild(divPassword);  
loginForm.appendChild(divTwoFactor);  
loginForm.appendChild(divButton);
