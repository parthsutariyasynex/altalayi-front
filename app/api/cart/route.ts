import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("authorization");

        const response = await fetch(
            "https://altalayi-demo.btire.com/rest/V1/carts/mine",
            {
                headers: {
                    Authorization: authHeader || "",
                },
            }
        );

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
