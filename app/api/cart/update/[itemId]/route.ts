import { NextRequest, NextResponse } from "next/server";

const MAGENTO_BASE_URL = "https://altalayi-demo.btire.com/rest/V1";

/* =========================
   UPDATE CART ITEM QTY
   PUT /api/cart/update/[itemId]
   Body: { qty: number }
========================= */
export async function PUT(
    req: NextRequest,
    { params }: { params: { itemId: string } }
) {
    try {
        const authHeader = req.headers.get("authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { itemId } = params;

        const body = await req.json();
        const { qty } = body;

        if (!qty || typeof qty !== "number" || qty < 1) {
            return NextResponse.json(
                { message: "qty is required and must be a positive number" },
                { status: 400 }
            );
        }

        const magentoUrl = `${MAGENTO_BASE_URL}/kleverapi/cart/update/${itemId}`;

        const response = await fetch(magentoUrl, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: authHeader,
            },
            body: JSON.stringify({ qty }),
        });

        const data = await response.json();
        console.log(
            `[cart/update] itemId=${itemId} qty=${qty} status=${response.status}`,
            JSON.stringify(data).slice(0, 300)
        );

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("[cart/update] Error:", error);
        return NextResponse.json(
            { message: "Failed to update cart item" },
            { status: 500 }
        );
    }
}
