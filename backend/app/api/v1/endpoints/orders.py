import os
import hmac
import hashlib
import razorpay
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, conint
from app.core.deps import CurrentUser

router = APIRouter(prefix="/orders", tags=["Orders"])

# Load credentials
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")

client = None
if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET:
    client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

class CreateOrderRequest(BaseModel):
    amount: conint(ge=100) # minimum 100 paise
    currency: str = "INR"
    receipt: str = "receipt_1"

class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

@router.post("/create-order")
async def create_order(data: CreateOrderRequest):
    if not client:
        raise HTTPException(status_code=500, detail="Razorpay credentials not configured")
    
    try:
        order_data = {
            "amount": data.amount,
            "currency": data.currency,
            "receipt": data.receipt
        }
        order = client.order.create(data=order_data)
        return order
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify-payment")
async def verify_payment(data: VerifyPaymentRequest):
    if not RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=500, detail="Razorpay credentials not configured")
    
    try:
        # Generate signature
        msg = f"{data.razorpay_order_id}|{data.razorpay_payment_id}".encode('utf-8')
        secret = RAZORPAY_KEY_SECRET.encode('utf-8')
        generated_signature = hmac.new(secret, msg, hashlib.sha256).hexdigest()
        
        if generated_signature == data.razorpay_signature:
            return {"status": "success", "message": "Payment verified successfully"}
        else:
            raise HTTPException(status_code=400, detail="Signature mismatch")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
