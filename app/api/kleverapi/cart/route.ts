import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

/* =========================
   GET CART (KleverAPI)
========================= */
export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("authorization");

        // Note: Removing the strict 401 requirement if you want to support guest carts,
        // but keeping it as you manually added it.
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ message: "Unauthorized: Missing customer token" }, { status: 401 });
        }

        const response = await fetch(`${BASE_URL}/cart`, {
            method: "GET",
            headers: {
                Authorization: authHeader,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        if (!response.ok) {
            const errBody = await response.text();
            console.error("Cart API error:", response.status, errBody);
            return NextResponse.json(
                { message: "Failed to fetch from KleverAPI", details: errBody },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Proxy GET Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

/* =========================
   ADD TO CART (Standard Magento fallback or custom)
========================= */
export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { sku, qty } = body;

        const response = await fetch(`${BASE_URL}/cart/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: authHeader,
            },
            body: JSON.stringify({
                sku,
                qty
            }),
        });

        if (!response.ok) {
            const errBody = await response.text();
            console.error("Add to Cart Proxy Error:", response.status, errBody);
            return NextResponse.json({ message: "Failed to add", details: errBody }, { status: response.status });
        }

        const data = await response.json();
        console.log("Add to Cart Proxy Response:", data);
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
