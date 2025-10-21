// Initialize QR code
let qrCode = null;
let tipQRCode = null;

// RLUSD issuer address
const RLUSD_ISSUER = 'rMxCKbEDwqr76QuheSUM7C5cB7WKoP1eS';

// Load saved XRP address from localStorage when the page loads
window.onload = function() {
    const savedAddress = localStorage.getItem('xrpAddress');
    if (savedAddress) {
        document.getElementById('xrp-address').value = savedAddress;
    }
};

// Update conversion display when inputs change
async function updateConversion() {
    const amount = document.getElementById('amount').value;
    const xrpAmountElement = document.getElementById('xrp-amount');
    
    if (!amount || parseFloat(amount) <= 0) {
        xrpAmountElement.textContent = '';
        return;
    }
    
    const fiatCurrency = document.getElementById('fiat-currency').value;
    const cryptoCurrency = document.getElementById('crypto-currency').value;
    
    try {
        let cryptoAmount = await convertAmount(parseFloat(amount), fiatCurrency, cryptoCurrency);
        xrpAmountElement.textContent = `${amount} ${fiatCurrency.toUpperCase()} = ${cryptoAmount} ${cryptoCurrency}`;
    } catch (error) {
        xrpAmountElement.textContent = '';
    }
}

// Convert fiat to crypto amount - COINGECKO 
async function convertAmount(fiatAmount, fiatCurrency, cryptoCurrency) {
    try {
        if (cryptoCurrency === 'XRP') {
            // XRP: Direct fiat → XRP
            const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=${fiatCurrency}`);
            const data = await response.json();
            const price = data.ripple[fiatCurrency];
            return (fiatAmount / price).toFixed(6);
        } else {
            // RLUSD: Fiat → USD → RLUSD (1:1)
            // First get fiat → USD rate
            let usdAmount;
            if (fiatCurrency === 'USD') {
                usdAmount = fiatAmount;
            } else {
                // EUR → USD (CoinGecko has EUR as currency)
                const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,${fiatCurrency}`);
                const data = await response.json();
                const usdPerEur = data.bitcoin.usd / data.bitcoin[fiatCurrency];  // 1 EUR = ? USD
                usdAmount = fiatAmount * usdPerEur;
            }
            
            // RLUSD = 1:1 USD (no API needed - stablecoin peg)
            return usdAmount.toFixed(2);
        }
    } catch (error) {
        // Ultimate fallback: Assume 1 EUR ≈ 1.09 USD, 1 USD = 1 RLUSD
        if (cryptoCurrency === 'XRP') {
            const fallbackPrices = { usd: 0.52, eur: 0.45 };  // Approx XRP prices
            const price = fallbackPrices[fiatCurrency];
            return price ? (fiatAmount / price).toFixed(6) : '0';
        } else {
            if (fiatCurrency === 'USD') {
                return fiatAmount.toFixed(2);
            } else {
                return (fiatAmount * 1.09).toFixed(2);  // 10 EUR = 10.90 RLUSD
            }
        }
    }
}

// Generate QR URI for XRP or RLUSD
function generateQRURI(address, amount, currency) {
    let uri = `xrpl:${address}?amount=${amount}`;
    
    if (currency === 'RLUSD') {
        uri += `&dt=RLUSD.${RLUSD_ISSUER}`;
    }
    
    return uri;
}

async function generateQR() {
    const address = document.getElementById('xrp-address').value.trim();
    const amount = document.getElementById('amount').value;
    const fiatCurrency = document.getElementById('fiat-currency').value;
    const cryptoCurrency = document.getElementById('crypto-currency').value;
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
        errorElement.textContent = 'Invalid XRPL address.';
        printButton.disabled = true;
        return;
    }

    if (parseFloat(amount) <= 0) {
        errorElement.textContent = 'Amount must be greater than 0.';
        printButton.disabled = true;
        return;
    }

    // Save address to localStorage
    localStorage.setItem('xrpAddress', address);

    // Convert fiat to crypto amount
    let cryptoAmount;
    try {
        cryptoAmount = await convertAmount(parseFloat(amount), fiatCurrency, cryptoCurrency);
        xrpAmountElement.textContent = `${amount} ${fiatCurrency.toUpperCase()} = ${cryptoAmount} ${cryptoCurrency}`;
    } catch (error) {
        errorElement.textContent = 'Error fetching price. Please try again.';
        printButton.disabled = true;
        return;
    }

    // Generate QR URI
    const qrData = generateQRURI(address, cryptoAmount, cryptoCurrency);

    // Generate QR code
    qrCode = new QRCode(document.getElementById('qrcode'), {
        text: qrData,
        width: 200,
        height: 200
    });

    // Update print template
    document.getElementById('print-address').textContent = address;
    document.getElementById('print-amount').textContent = `${cryptoAmount} ${cryptoCurrency}`;
    document.getElementById('print-qrcode').innerHTML = '';
    new QRCode(document.getElementById('print-qrcode'), {
        text: qrData,
        width: 200,
        height: 200
    });

    printButton.disabled = false;
}

// Print function
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
            const tipAddress = 'rQERimqpZebP1Knt3BCMZHDMJWZ7u6ZBuW';
            const tipQRData = `xrpl:${tipAddress}?amount=1`;
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

function clearSavedAddress() {
    localStorage.removeItem('xrpAddress');
    document.getElementById('xrp-address').value = '';
    document.getElementById('xrp-amount').textContent = '';
    document.getElementById('qrcode').innerHTML = '';
    document.getElementById('print-button').disabled = true;
    alert('Saved address cleared.');
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('amount').addEventListener('input', updateConversion);
    document.getElementById('fiat-currency').addEventListener('change', updateConversion);
    document.getElementById('crypto-currency').addEventListener('change', updateConversion);
});
