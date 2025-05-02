function setupTwoFactor() {
    // First enable 2FA and get secret key
    fetch(`/api/User/enable-2fa/${getUserid()}`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
        }
    })
    .then(response => response.json())
    .then(data => {
        // Then get QR code with the new secret
        fetch(`/api/TwoFactor/setup/${data.UserId}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
            }
        })
        .then(response => response.json())
        .then(qrData => {
            createTwoFactorSetupForm(qrData.secretKey);
        });
    })
    .catch(error => {
        toastr.error('Error setting up 2FA: ' + error.message, 'Error');
    });
}

function createTwoFactorSetupForm(secretKey) {
    var mainTitle = document.createElement('h1');
    mainTitle.innerText = 'Setup Two-Factor Authentication';

    var main = document.getElementById('main');
    main.innerHTML = '';
    main.appendChild(mainTitle);

    // QR Code container
    var qrContainer = document.createElement('div');
    qrContainer.id = 'qrContainer';
    main.appendChild(qrContainer);

    // Manual entry code
    var manualCode = document.createElement('p');
    manualCode.innerText = 'Manual entry key: ' + secretKey;
    main.appendChild(manualCode);

    // Verification code input
    var codeLabel = document.createElement('label');
    codeLabel.innerText = 'Enter verification code:';
    
    var codeInput = document.createElement('input');
    codeInput.type = 'text';
    codeInput.id = 'verificationCode';
    
    var verifyButton = document.createElement('button');
    verifyButton.innerText = 'Verify';
    verifyButton.onclick = verifyTwoFactor;

    var form = document.createElement('div');
    form.appendChild(codeLabel);
    form.appendChild(document.createElement('br'));
    form.appendChild(codeInput);
    form.appendChild(document.createElement('br'));
    form.appendChild(verifyButton);

    main.appendChild(form);

    // Generate QR code
    fetch(`/api/TwoFactor/setup/${getUserid()}`, {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
        }
    })
    .then(response => response.json())
    .then(data => {
        var img = document.createElement('img');
        img.src = data.qrCodeImageUrl;
        qrContainer.appendChild(img);
    });
}

function verifyTwoFactor() {
    var code = document.getElementById('verificationCode').value;
    
    fetch('/api/TwoFactor/activate', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
        },
        body: JSON.stringify({
            UserId: getUserid(),
            Code: code
        })
    })
    .then(response => {
        if (response.ok) {
            alert('2FA activated successfully!');
            window.location.href = 'index.html';
        } else {
            alert('Verification failed');
        }
    });
}
