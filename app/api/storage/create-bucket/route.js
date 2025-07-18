import { NextResponse } from "next/server";
import { createClerkSupabaseClient } from "@/app/ssr/client"

const client = createClerkSupabaseClient()

export async function POST(request){
    const { user } = await request.json()

    const { data, error } = await client
    .storage
    .from('tes')
    .upload(`${user?.id}/.emptyFolderPlaceholder`, new Blob(['']))

    if(error){
        return NextResponse.json(
            { status: 500, message:"Failed to create folder", error }
        )
    }else{
        return NextResponse.json(
            { status: 200, message:"Success to create folder", data }
        )
    }
}