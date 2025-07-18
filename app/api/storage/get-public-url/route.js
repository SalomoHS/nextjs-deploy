import { NextResponse } from "next/server";
import { createClerkSupabaseClient } from "@/app/ssr/client"

const client = createClerkSupabaseClient()

export async function POST(request){
    const { user, file } = await request.json()

    const { data, error } = await client
    .storage
    .from('tes')
    .getPublicUrl(`${user?.id}/${file?.name}`)

    if(error){
        return NextResponse.json(
            { status: 500, message:"Failed retrieve url", error }
        )
    }else{
        return NextResponse.json(
            { status: 200, message:"Success retrieve url", data }
        )
    }
}