import { NextResponse } from "next/server";
import { createClerkSupabaseClient } from "@/app/ssr/client"

const client = createClerkSupabaseClient()

export async function POST(request){
    const formData = await request.formData();
  const file = formData.get("file");
  const userId = formData.get("userId");
    console.log(file)
  const arrayBuffer = await file.arrayBuffer();

  const { data, error } = await client.storage
    .from("tes")
    .upload(`${userId}/${file.name}`, arrayBuffer, {
      contentType: "video/mp4",
      upsert: true,
    });

    if(error){
        return NextResponse.json(
            { status: 500, message:"Failed uploading file", error }
        )
    }else{
        return NextResponse.json(
            { status: 200, message:"Success uploading file", data }
        )
    }
}