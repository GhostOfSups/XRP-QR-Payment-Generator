// Initialize QR code
let qrCode = null;
let tipQRCode = null;

// Load saved XRP address from localStorage when the page loads
window.onload = function() {
    const savedAddress = localStorage.getItem('xrpAddress');
    if (savedAddress) {
        document.getElementById('xrp-address').value = savedAddress;
    }
};

async function generateQR() {
    const address = document.getElementById('xrp-address').value.trim();
    const amount = document.getElementById('amount').value;
    const currency = document.getElementById('currency').value;
    const errorElement = document.getElementById('error');
    const xrpAmountElement = document.getElementById('xrp-amount');
    const printButton = document.getElementById('print-button');

    // Clear previous error and QR code
    errorElement.textContent = '';
    xrpAmountElement.textContent = '';
    document.getElementById('qrcode').innerHTML = '';

    // Validate inputs
    if (!address || !amount) {
        errorElement.textContent = 'Please fill in all fields.';
        printButton.disabled = true;
        return;
    }

    if (!address.startsWith('r') || address.length < 25 || address.length > 35) {
        errorElement.textContent = 'Invalid XRP address.';
        printButton.disabled = true;
        return;
    }

    if (amount <= 0) {
        errorElement.textContent = 'Amount must be greater than 0.';
        printButton.disabled = true;
        return;
    }

    // Save XRP address to localStorage
    localStorage.setItem('xrpAddress', address);

    // Fetch XRP price if currency is not XRP
    let xrpAmount = amount;
    if (currency !== 'xrp') {
        try {
            const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=${currency}`);
            const data = await response.json();
            const price = data.ripple[currency.toLowerCase()];
            xrpAmount = (amount / price).toFixed(6);
            xrpAmountElement.textContent = `Equivalent: ${xrpAmount} XRP`;
        } catch (error) {
            errorElement.textContent = 'Error fetching XRP price. Please try again.';
            printButton.disabled = true;
            return;
        }
    }

    // Generate QR code
    const qrData = `xrp:${address}?amount=${xrpAmount}`;
    qrCode = new QRCode(document.getElementById('qrcode'), {
        text: qrData,
        width: 200,
        height: 200
    });

    // Update print template
    document.getElementById('print-address').textContent = address;
    document.getElementById('print-amount').textContent = `${xrpAmount} XRP`;
    document.getElementById('print-qrcode').innerHTML = '';
    new QRCode(document.getElementById('print-qrcode'), {
        text: qrData,
        width: 200,
        height: 200
    });

    printButton.disabled = false;
}

// existing functions (printQR, toggleTipQR) remain unchanged
function printQR() {
    const printContent = document.getElementById('print-content').outerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Print QR Code</title>
            <style>
                body { text-align: center; font-family: Arial, sans-serif; }
                #print-content { margin: 0 auto; }
            </style>
        </head>
        <body>${printContent}</body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

function toggleTipQR() {
    const tipQRDiv = document.getElementById('tip-qrcode');
    const tipButton = document.getElementById('tip-button');

    if (tipQRDiv.style.display === 'none') {
        tipQRDiv.style.display = 'block';
        tipButton.textContent = 'Hide Tip QR Code';
        if (!tipQRCode) {
            const tipAddress = 'rQERimqpZebP1Knt3BCMZHDMJWZ7u6ZBuW'; // tip address
            const tipQRData = `xrp:${tipAddress}?amount=1`;
            tipQRCode = new QRCode(tipQRDiv, {
                text: tipQRData,
                width: 150,
                height: 150
            });
        }
    } else {
        tipQRDiv.style.display = 'none';
        tipButton.textContent = 'Tip the Dev (1 XRP)';
    }
}
// New function to clear saved address
function clearSavedAddress() {
    localStorage.removeItem('xrpAddress');
    document.getElementById('xrp-address').value = '';
    alert('Saved address cleared.');
}
