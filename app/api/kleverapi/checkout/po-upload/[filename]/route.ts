import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ filename: string }> }
) {
    try {
        const { filename } = await params;
        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        console.log(">>> PO Delete REQUEST:", filename);

        const response = await fetch(`${BASE_URL}/checkout/po-upload/${filename}`, {
            method: "DELETE",
            headers: {
                Authorization: authHeader,
                platform: "web",
            },
        });

        const data = await response.json();
        console.log("<<< PO Delete RESPONSE:", response.status);

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Proxy PO Delete Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
