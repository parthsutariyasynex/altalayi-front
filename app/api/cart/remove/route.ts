import { NextResponse } from "next/server";

const NEXT_PUBLIC_BASE_URL = "https://altalayi-demo.btire.com/rest/V1";

/* =========================
   REMOVE CART ITEM
========================= */
export async function DELETE(req: Request) {
    try {
        const authHeader = req.headers.get("authorization");

        if (!authHeader) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { item_id } = body;

        if (!item_id) {
            return NextResponse.json(
                { message: "item_id is required" },
                { status: 400 }
            );
        }

        const response = await fetch(`${NEXT_PUBLIC_BASE_URL}/kleverapi/cart/remove`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: authHeader,
            },
            body: JSON.stringify({ item_id }),
        });

        const data = await response.json();
        console.log("Kleverapi remove-from-cart:", JSON.stringify(data).slice(0, 400));

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Remove from cart error:", error);
        return NextResponse.json(
            { message: "Failed to remove from cart" },
            { status: 500 }
        );
    }
}
