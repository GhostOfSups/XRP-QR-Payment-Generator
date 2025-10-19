# XRP QR Payment Generator

A simple web app to generate QR codes for XRP payments. Sellers input their XRP address and a payment amount in EUR or USD, and the app converts it to XRP and creates a scannable QR code.

Try it here:
https://GhostOfSups.github.io/XRP-QR-Payment-Generator

## Features
- Input XRP address and validate format
- Enter payment amount in EUR or USD
- Real-time conversion to XRP using CoinGecko API
- Generates QR code with XRPL URI (`xrpl:address?amount=...`)
- "Print QR Code" button to create a print-friendly page with QR code, address, and amount
- "Tip the Dev" button to send 1 XRP to the developer's address
- Responsive design for mobile and desktop

## Setup
1. Clone the repository: `git clone https://github.com/<your-username>/XRP-QR-Payment-Generator.git`
2. Open `index.html` in a browser or host via GitHub Pages.
3. No server-side setup required; uses client-side JavaScript and public APIs.

## Dependencies
- [qrcode.js](https://davidshimjs.github.io/qrcodejs/) (loaded via CDN)
- [CoinGecko API](https://www.coingecko.com/en/api) (free, no API key needed)

## Usage
1. Enter your XRP address (starts with 'r', 25-35 characters).
2. Input the payment amount and select EUR or USD.
3. Click "Generate QR Code" to see the XRP equivalent and QR code.
4. Click "Print QR Code" to print a page with the QR code, address, and amount for product labels or receipts.
5. Click "Tip the Dev" to show a QR code for sending 1 XRP to the developer.
6. Buyers scan the QR with an XRP wallet (e.g., Xaman, Trust Wallet).

## License
MIT License
