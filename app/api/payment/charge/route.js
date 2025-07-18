import Midtrans from "midtrans-client"
import { NextResponse } from "next/server";

let core = new Midtrans.CoreApi({
        isProduction : false,
        serverKey : process.env.MIDTRANS_SERVER_KEY,
        clientKey : process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
    });


export async function POST(request){
    const { paymentType, selectedBank, amount } = await request.json()
    console.log(paymentType, selectedBank, amount)
    let parameter
    if (paymentType === "virtual_account") {
        parameter = {
            "payment_type": {paymentType},
            "transaction_details": {
                "order_id": ~~(Math.random() * 100)+1,
                "gross_amount": 20000,
            },
            "bank_transfer":{
                "bank": {selectedBank}
            }
        };
    } else {
        parameter = {
            "payment_type": "gopay",
            "transaction_details": {
                "gross_amount": 20000,
                "order_id": ~~(Math.random() * 100)+1,
            }
        };
    }
    
    // charge transaction
    const chargeResponse = await core.charge(parameter)
    console.log(chargeResponse);
    
    return NextResponse.json({ chargeResponse })
} 