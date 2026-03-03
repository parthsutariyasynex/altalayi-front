import { NextRequest, NextResponse } from "next/server";

const MAGENTO_BASE_URL = "https://altalayi-demo.btire.com/rest/V1";

/* =========================
   REMOVE CART ITEM BY ID
   DELETE /api/cart/remove/[itemId]
========================= */
export async function DELETE(
    req: NextRequest,
    { params }: { params: { itemId: string } }
) {
    try {
        const authHeader = req.headers.get("authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { itemId } = params;

        if (!itemId) {
            return NextResponse.json(
                { message: "itemId is required" },
                { status: 400 }
            );
        }

        const magentoUrl = `${MAGENTO_BASE_URL}/kleverapi/cart/remove/${itemId}`;

        const response = await fetch(magentoUrl, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: authHeader,
            },
        });

        const data = await response.json();
        console.log(
            `[cart/remove] itemId=${itemId} status=${response.status}`,
            JSON.stringify(data).slice(0, 300)
        );

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("[cart/remove] Error:", error);
        return NextResponse.json(
            { message: "Failed to remove item from cart" },
            { status: 500 }
        );
    }
}
