// Basic XRP address validation (starts with 'r', 25-35 chars)
function isValidXRPAddress(address) {
    return /^r[0-9a-zA-Z]{24,34}$/.test(address);
}

// Fetch XRP price from CoinGecko
async function getXRPPrice(currency) {
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=${currency}`);
        const data = await response.json();
        return data.ripple[currency.toLowerCase()];
    } catch (error) {
        console.error('Error fetching XRP price:', error);
        return null;
    }
}

// Generate main payment QR code
async function generateQR() {
    const address = document.getElementById('xrp-address').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const currency = document.getElementById('currency').value;
    const errorDiv = document.getElementById('error');
    const xrpAmountDiv = document.getElementById('xrp-amount');
    const qrDiv = document.getElementById('qrcode');

    // Clear previous results
    errorDiv.style.display = 'none';
    xrpAmountDiv.textContent = '';
    qrDiv.innerHTML = '';

    // Validate inputs
    if (!isValidXRPAddress(address)) {
        errorDiv.textContent = 'Invalid XRP address. Must start with "r" and be 25-35 characters.';
        errorDiv.style.display = 'block';
        return;
    }
    if (!amount || amount <= 0) {
        errorDiv.textContent = 'Please enter a valid amount.';
        errorDiv.style.display = 'block';
        return;
    }

    // Fetch XRP price and convert amount
    const price = await getXRPPrice(currency);
    if (!price) {
        errorDiv.textContent = 'Failed to fetch XRP price. Try again later.';
        errorDiv.style.display = 'block';
        return;
    }

    const xrpAmount = (amount / price).toFixed(6); // 6 decimals for XRP
    xrpAmountDiv.textContent = `Equivalent: ${xrpAmount} XRP`;

    // Generate QR code with XRPL URI
    const qrText = `xrpl:${address}?amount=${xrpAmount}`;
    new QRCode(qrDiv, {
        text: qrText,
        width: 200,
        height: 200
    });
}

// Toggle and generate tip QR code
function toggleTipQR() {
    const tipQrDiv = document.getElementById('tip-qrcode');
    const tipButton = document.getElementById('tip-button');
    const devAddress = 'rQERimqpZebP1Knt3BCMZHDMJWZ7u6ZBuW'; // Replace with your XRP address
    const tipAmount = '1'; // Fixed 1 XRP tip

    if (tipQrDiv.style.display === 'none' || tipQrDiv.innerHTML === '') {
        // Show and generate tip QR code
        tipQrDiv.innerHTML = ''; // Clear previous QR
        const qrText = `xrpl:${devAddress}?amount=${tipAmount}`;
        new QRCode(tipQrDiv, {
            text: qrText,
            width: 200,
            height: 200
        });
        tipQrDiv.style.display = 'flex';
        tipButton.textContent = 'Hide Tip QR Code';
    } else {
        // Hide tip QR code
        tipQrDiv.style.display = 'none';
        tipButton.textContent = 'Tip the Dev (1 XRP)';
    }
}
