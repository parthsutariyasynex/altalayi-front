import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Await params (IMPORTANT in Next 16)
    const { id } = await context.params;

    const token = req.headers.get("authorization");

    if (!token) {
      return NextResponse.json(
        { error: "Token missing" },
        { status: 401 }
      );
    }

    const res = await fetch(
      `https://altalayi-demo.btire.com/rest/V1/kleverapi/cart/remove/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Magento API failed" },
        { status: res.status }
      );
    }

    const data = await res.json();

    return NextResponse.json(data);

  } catch {
    return NextResponse.json(
      { error: "Failed to remove from cart" },
      { status: 500 }
    );
  }
}