import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest){
    const link = await request.nextUrl.searchParams.get("link")
    const encoded = btoa(`${process.env.MIDTRANS_SERVER_KEY}:`);
    if (!link) {
    return NextResponse.json({ error: "Missing link" }, { status: 400 });
  }
    const getQrCode =  await fetch(link, {
      method:"GET",
      headers: {
      'accept': "application/json",
      "Content-Type": "application/json",
      Authorization: `Basic ${encoded}`,
    }
    })
    
    const qrcode = await getQrCode.arrayBuffer() 
    return new NextResponse(Buffer.from(qrcode), {
        status: 200,  
        headers: {
            "Content-Type": "image/png",
            "Content-Length": String(qrcode.byteLength),
        },
    });

}