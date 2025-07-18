import { createClerkSupabaseClient } from "@/app/ssr/client";
import { NextResponse } from "next/server";

const client = createClerkSupabaseClient()

export async function POST(request){
    
    const { user } = await request.json() 
    const { data: existingUser, error: fetchError } = await client
      .from("user")
      .select("user_id")
      .eq("user_id", user.id)

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 is "Results contain 0 rows" — not an actual error for this case
      console.error("Error checking user existence:", fetchError.message);
    } 

    const isExist = existingUser ? true : false
    return NextResponse.json({ isExist })
}