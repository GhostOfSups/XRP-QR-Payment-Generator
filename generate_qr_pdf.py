import qrcode
from PIL import Image
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import requests
import json

def get_xrp_price(currency='eur'):
    """Fetch current XRP price in EUR or USD from CoinGecko API."""
    url = f"https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies={currency}"
    try:
        response = requests.get(url)
        data = response.json()
        return data['ripple'][currency.upper()]
    except Exception as e:
        print(f"Error fetching price: {e}")
        return None  # Fallback; you could hardcode a price here if needed

def generate_qr_pdf(xrp_address, amount_fiat, fiat_currency='EUR', output_pdf='xrp_qr_payment.pdf', output_qr='qr_code.png'):
    """
    Generate QR code for XRP payment and embed in PDF.
    
    Args:
    - xrp_address: Your XRP wallet address (e.g., starts with 'r').
    - amount_fiat: Payment amount in fiat (EUR or USD).
    - fiat_currency: 'EUR' or 'USD'.
    - output_pdf: Name for the generated PDF file.
    - output_qr: Name for the standalone QR image file (optional).
    """
    # Validate XRP address (basic check)
    if not (xrp_address.startswith('r') and 25 <= len(xrp_address) <= 35):
        raise ValueError("Invalid XRP address: Must start with 'r' and be 25-35 chars long.")
    
    # Fetch XRP price and convert
    xrp_price = get_xrp_price(fiat_currency.lower())
    if xrp_price is None:
        raise ValueError("Could not fetch XRP price. Check your internet connection.")
    
    amount_xrp = amount_fiat / xrp_price
    # Format XRPL URI (same as your JS app)
    uri = f"xrpl:{xrp_address}?amount={amount_xrp:.6f}"
    
    print(f"Generated URI: {uri}")
    print(f"XRP Amount: {amount_xrp:.6f} XRP (based on 1 XRP ≈ {xrp_price:.4f} {fiat_currency})")
    
    # Generate QR code as image
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(uri)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    img.save(output_qr)
    print(f"QR image saved: {output_qr}")
    
    # Create PDF with embedded QR
    c = canvas.Canvas(output_pdf, pagesize=letter)
    width, height = letter
    
    # Add title and details
    c.setFont("Helvetica-Bold", 16)
    c.drawString(100, height - 100, "XRP Payment QR Code")
    
    c.setFont("Helvetica", 12)
    c.drawString(100, height - 130, f"Address: {xrp_address}")
    c.drawString(100, height - 150, f"Amount: {amount_fiat} {fiat_currency} ({amount_xrp:.6f} XRP)")
    c.drawString(100, height - 170, f"Current rate: 1 XRP ≈ {xrp_price:.4f} {fiat_currency}")
    
    # Embed QR image (positioned centered below text)
    qr_width = 200
    qr_x = (width - qr_width) / 2
    qr_y = height - 300
    c.drawImage(output_qr, qr_x, qr_y, width=qr_width, height=qr_width)
    
    # Add scan instructions
    c.setFont("Helvetica", 10)
    c.drawString(100, qr_y - 30, "Scan with an XRP wallet (e.g., Xaman) to pay.")
    
    c.save()
    print(f"PDF saved: {output_pdf}")

# Example usage (customize these)
if __name__ == "__main__":
    generate_qr_pdf(
        xrp_address="rYourXRPAddressHere1234567890",  # Replace with your address
        amount_fiat=10.0,  # e.g., 10 EUR
        fiat_currency="EUR"
    )
