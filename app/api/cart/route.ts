import { NextResponse } from "next/server";

const BASE_URL = "https://altalayi-demo.btire.com/rest/V1";

/* =========================
   GET CART
========================= */
export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ message: "Unauthorized: Missing customer token" }, { status: 401 });
        }

        const response = await fetch(`${BASE_URL}/carts/mine`, {
            method: "GET",
            headers: {
                Authorization: authHeader,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errBody = await response.text();
            console.error("Magento cart API error:", response.status, errBody);
            return NextResponse.json(
                { message: "Magento cart API error", details: errBody },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Fetch cart error:", error);
        return NextResponse.json(
            { message: "Failed to fetch cart" },
            { status: 500 }
        );
    }
}

/* =========================
   ADD TO CART
========================= */
export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get("authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ message: "Unauthorized: Missing customer token" }, { status: 401 });
        }

        const body = await req.json();
        const { sku, qty } = body;

        if (!sku || !qty) {
            return NextResponse.json(
                { message: "SKU and quantity are required" },
                { status: 400 }
            );
        }

        const response = await fetch(`${BASE_URL}/carts/mine/items`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: authHeader,
            },
            body: JSON.stringify({
                cartItem: {
                    sku,
                    qty,
                    quote_id: "mine"
                }
            }),
        });

        if (!response.ok) {
            const errBody = await response.text();
            console.error("Magento cart API POST error:", response.status, errBody);
            return NextResponse.json(
                { message: "Failed to add to cart", details: errBody },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Add to cart error:", error);
        return NextResponse.json(
            { message: "Failed to add to cart" },
            { status: 500 }
        );
    }
}