import { NextResponse } from "next/server";

const BASE_URL = "https://altalayi-demo.btire.com/rest/V1";

/* =========================
   GET CART
========================= */
export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("authorization");

        if (!authHeader) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const response = await fetch(`${BASE_URL}/kleverapi/cart`, {
            method: "GET",
            headers: {
                Authorization: authHeader,
            },
        });

        const data = await response.json();
        console.log("Kleverapi GET cart:", JSON.stringify(data).slice(0, 400));

        return NextResponse.json(data, { status: response.status });
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

        if (!authHeader) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { sku, qty } = body;

        if (!sku || !qty) {
            return NextResponse.json(
                { message: "SKU and quantity are required" },
                { status: 400 }
            );
        }

        const response = await fetch(`${BASE_URL}/kleverapi/cart/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: authHeader,
            },
            body: JSON.stringify({ sku, qty }),
        });

        const data = await response.json();
        console.log("Kleverapi add-to-cart:", JSON.stringify(data).slice(0, 400));

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Add to cart error:", error);
        return NextResponse.json(
            { message: "Failed to add to cart" },
            { status: 500 }
        );
    }
}