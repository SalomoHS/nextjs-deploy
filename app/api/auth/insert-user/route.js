import { NextResponse } from "next/server";
import { createClerkSupabaseClient } from "@/app/ssr/client"

const client = createClerkSupabaseClient()

export async function POST(request){
    const { user } = await request.json()

    const { error: insertError } = await client
    .from("user")
    .insert({
        user_id: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        username: user.username,
        first_name: user.firstName,
        last_name: user.lastName
    })
    .single();

    if (insertError) {
        return NextResponse.json(
            { status: 500, message: insertError.message }
        )
    } else {
        return NextResponse.json(
            { status: 200, message:"User inserted successfully" }
        )
    }
    
}