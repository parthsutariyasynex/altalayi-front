import { NextResponse } from "next/server";

const BASE_URL = "https://altalayi-demo.btire.com/rest/V1";

/* =========================
   UPDATE CART ITEM QTY
========================= */
export async function PUT(req: Request) {
    try {
        const authHeader = req.headers.get("authorization");

        if (!authHeader) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { item_id, qty } = body;

        if (!item_id || !qty) {
            return NextResponse.json(
                { message: "item_id and qty are required" },
                { status: 400 }
            );
        }

        const response = await fetch(`${BASE_URL}/carts/mine/items/${item_id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: authHeader,
            },
            body: JSON.stringify({
                cartItem: {
                    item_id,
                    qty,
                    quote_id: "mine",
                },
            }),
        });

        const data = await response.json();
        console.log("Update cart item response:", JSON.stringify(data).slice(0, 300));

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Update cart error:", error);
        return NextResponse.json(
            { message: "Failed to update cart item" },
            { status: 500 }
        );
    }
}
