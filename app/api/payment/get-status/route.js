import { NextResponse } from "next/server";

export async function POST(request){
    const { transactionId } = await request.json()
    const encoded = btoa(`${process.env.MIDTRANS_SERVER_KEY}:`);
    const isPending =  await fetch(`https://api.sandbox.midtrans.com/v2/${transactionId}/status`, {
      method:"GET",
      headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Basic ${encoded}`,
    }
    })
    
    const status = await isPending.json() 
    return NextResponse.json({ status })
}