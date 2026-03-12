import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {

        const body = await req.json();

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/forget-password-mobile`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    platform: "web"
                },
                body: JSON.stringify(body)
            }
        );

        const data = await response.json();

        return NextResponse.json(data, { status: response.status });

    } catch (error: any) {

        return NextResponse.json(
            { message: error.message || "Server error" },
            { status: 500 }
        );

    }
}