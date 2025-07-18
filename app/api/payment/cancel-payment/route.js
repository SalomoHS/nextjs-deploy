import { NextResponse } from "next/server";

export async function POST(request){
    const { transactionId } = await request.json()
    console.log(transactionId)
    const encoded = btoa(`${process.env.MIDTRANS_SERVER_KEY}:`);
    const cancelRequest =  await fetch(`https://api.sandbox.midtrans.com/v2/${transactionId}/cancel`, {
      method:"POST",
      headers: {
      'accept': "application/json",
      "Content-Type": "application/json",
      Authorization: `Basic ${encoded}`,
    }
    })

    const cancelResponse = await cancelRequest.json() 
    console.log(cancelResponse)
    return NextResponse.json({ cancelResponse })
}