import { NextResponse } from "next/server";

export async function GET() {
    // Return an empty array as a fallback for the notifications feature
    return NextResponse.json([]);
}
